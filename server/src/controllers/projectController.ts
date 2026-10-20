import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";


const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
});

export async function createProject(req: Request, res: Response) {
    try {
        const { organizationId } = req.params;
        if (typeof organizationId !== "string") {
            return res.status(400).json({ message: "Invalid organization ID" });
        }

        const { userId } = req;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const validationResult = createProjectSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid input",
                error: validationResult.error.flatten().fieldErrors,
            });
        }

        const name = validationResult.data.name;

        const project = await prisma.project.create({
            data: {
                name,
                organizationId,
                boardColumns: {
                    create: [
                        { name: "A faire", position: 0 },
                        { name: "En cours", position: 1 },
                        { name: "Terminé", position: 2 },
                    ],
                },
            },
            include: {
                boardColumns: true,
            },
        });

        return res.status(201).json({
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}