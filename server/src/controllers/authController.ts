import { z } from "zod";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6),
});

const loginSchema = z.object({
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

export async function login(req: Request, res: Response) {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
                error: result.error.flatten().fieldErrors,
            });
        }

        const { email, password } = result.data;
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    } 
}

export async function refresh(req: Request, res: Response) { 
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
        const token = jwt.sign(
            { userId: payload.userId },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );
        return res.status(200).json({ token });
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
}

export async function logout(req: Request, res: Response) {
  return res.status(200).json({ message: "Logged out successfully" });
}