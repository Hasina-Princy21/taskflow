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