import express, { Application, Request, Response } from "express";
import cors from "cors";    
import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth";
import organization from "./routes/organization";
import invitationRoutes from "./routes/invitation";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: "Ok",
            database: "Connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        res.status(503).json({
            status: "Error",
            database: "Disconnected",
            timestamp: new Date().toISOString(),
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organization);
app.use("/api/invitations", invitationRoutes);

export default app;