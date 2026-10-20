import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getInvitation(req: Request, res: Response) {
    try {
        const { token } = req.params;
        if (typeof token !== "string") {
            return res.status(400).json({ message: "Invalid invitation token" });
        }

        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: {
                organization: {
                    select: { name: true },
                },
            },
        });

        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found" });
        }

        if (invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invitation is no longer valid" });
        }

        const user = await prisma.user.findUnique({ 
            where: { email: invitation.email } 
        });
        const hasAccount = Boolean(user);

        return res.status(200).json({
            organizationName: invitation.organization.name,
            email: invitation.email,
            hasAccount,
        });

    } catch (error) {
        console.error("Error fetching invitation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptInvitation(req: Request, res: Response) {
  try {
    const { token } = req.params;

    // 1. Vérification du token (400) et de la présence de l'utilisateur connecté (401)
    if (typeof token !== "string") {
      return res.status(400).json({ message: "Invalid invitation token" });
    }
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.userId;

    // 2. Chercher l'invitation par token (404)
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // 3. Statut différent de PENDING ou invitation expirée (410)
    if (invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
      return res.status(410).json({ message: "This invitation is no longer valid" });
    }

    // 4. Récupérer l'utilisateur connecté pour vérifier que son email correspond
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!currentUser || currentUser.email !== invitation.email) {
      return res.status(403).json({ message: "You are not authorized to accept this invitation" });
    }

    // 5. Vérifier s'il est déjà membre de cette organisation (409)
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.userId,
          organizationId: invitation.organizationId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({ message: "You are already a member of this organization" });
    }

    // 6. Transaction Prisma : Ajouter aux membres + Mettre à jour l'invitation
    await prisma.$transaction(async (tx) => {
      await tx.organizationMember.create({
        data: {
          userId,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });
    });

    // 7. Succès 200 avec l'organizationId pour la redirection côté frontend
    return res.status(200).json({
      organizationId: invitation.organizationId,
    });

  } catch (error) {
    console.error("Error accepting invitation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listInvitations(req: Request, res: Response) {
    try {
        const { organizationId } = req.params;
        if (typeof organizationId !== "string") {
            return res.status(400).json({ message: "Invalid organization ID" });
        }

        // On liste uniquement les invitations PENDING de l'organisation, sans exposer le token
        const invitations = await prisma.invitation.findMany({
            where: { 
                organizationId,
                status: "PENDING",
            },
            select: {
                id: true,
                email: true,
                role: true,
                expiresAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ invitations });
    } catch (error) {
        console.error("Error listing invitations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function cancelInvitation(req: Request, res: Response) { 
    try {
        const { organizationId, invitationId } = req.params;
        if (typeof organizationId !== "string" || typeof invitationId !== "string") {
            return res.status(400).json({ message: "Invalid organization or invitation ID" });
        }

        // Chercher l'invitation par son ID
        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
        });

        // Anti-IDOR : si l'invitation n'existe pas OU n'appartient pas à cette organisation, on renvoie 404
        if (!invitation || invitation.organizationId !== organizationId) {
            return res.status(404).json({ message: "Invitation not found" });
        }

        // Seule une invitation PENDING peut être annulée (sinon 409 Conflict)
        if (invitation.status !== "PENDING") {
            return res.status(409).json({ message: "Only pending invitations can be canceled" });
        }

        // Passage du statut à CANCELLED
        await prisma.invitation.update({
            where: { id: invitationId },
            data: { status: "CANCELLED" },
        });

        return res.status(200).json({ message: "Invitation canceled successfully" });
    } catch (error) {
        console.error("Error canceling invitation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}