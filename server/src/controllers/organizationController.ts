import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createOrganization = async (req: Request, res: Response) => { 
    try { 
        const { name } = req.body;
        const userId = req.userId;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({
                message: "Invalid organization name",
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: name.trim(),
                },
            });

            const membership = await tx.organizationMember.create({
                data: {
                    organizationId: organization.id,
                    userId: userId,
                    role: "OWNER",
                },
            });

            return { organization, membership };
        });

        return res.status(201).json({
            message: "Organization created successfully",
            organization: result.organization,
            membership: result.membership,
        });

    } catch (error) {
        console.error("Error creating organization:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function getOrganization(req: Request, res: Response) {
    try {
        const { userId } = req;
        if (!userId || typeof userId !== "string") {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const memberships = await prisma.organizationMember.findMany({
            where: { userId },
            include: {
                organization: true,
            },
        });

        const organizations = memberships.map(membership => ({
            id: membership.organization.id,
            name: membership.organization.name,
            role: membership.role,
        }));

        return res.status(200).json({ organizations });
    } catch (error) {
        console.error("Error fetching organization:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}