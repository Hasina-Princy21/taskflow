import { Request, Response } from "express";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "../config/prisma";

const inviteSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export async function inviteMember(req: Request, res: Response) {
  try {
    const { organizationId } = req.params;
    if (typeof organizationId !== "string") {
      return res.status(400).json({ message: "Invalid organization ID" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = inviteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        error: result.error.flatten().fieldErrors,
      });
    }

    const { email } = result.data;

    // La personne invitée a-t-elle déjà un compte, et est-elle déjà membre ?
    const targetUser = await prisma.user.findUnique({ where: { email } });

    if (targetUser) {
      const existingMembership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: targetUser.id,
            organizationId,
          },
        },
      });

      if (existingMembership) {
        return res
          .status(409)
          .json({ message: "User is already a member of this organization" });
      }
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Crée l'invitation, ou la remet à neuf si elle existe déjà
    await prisma.invitation.upsert({
      where: {
        email_organizationId: { email, organizationId },
      },
      create: {
        email,
        token,
        expiresAt,
        role: "MEMBER",
        organizationId,
        invitedById: req.userId,
      },
      update: {
        token,
        expiresAt,
        status: "PENDING",
        invitedById: req.userId,
      },
    });

    const invitationLink = `${process.env.CLIENT_URL}/invitations/${token}`;

    return res.status(201).json({
      message: "Invitation created successfully",
      invitationLink,
    });
  } catch (error) {
    console.error("Error inviting member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}