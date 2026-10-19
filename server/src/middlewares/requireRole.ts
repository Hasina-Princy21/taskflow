import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export function requireRole(allowedRoles: Role[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const { organizationId } = req.params;
            if (typeof organizationId !== "string") {
                return res.status(400).json({ message: "Organization identifier is missing in the URL" });
            }

            const membership = await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: req.userId,
                        organizationId: organizationId,
                    },
                },
            });

            if(!membership) {
                return res.status(404).json({ message: "Organization not found or access denied" });
            }

            if(!allowedRoles.includes(membership.role)) {
                return res.status(403).json({ message: "You are not allowed to perform this action" });
            }

            return next();
        } catch (error) {
            console.error("Error while checking role :", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}