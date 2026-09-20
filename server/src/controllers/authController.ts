import { z } from "zod";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
    // Implement registration logic here
    try {

        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
                error: result.error.flatten().fieldErrors,
            });
        }

        const { email, password, name } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists",
            });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },

            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}