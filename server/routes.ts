import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromoCodeSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Promo Code Routes
  app.get("/api/promoCodes/:code", async (req, res) => {
    const code = req.params.code;
    const promo = await storage.getPromoCodeByCode(code);
    if (promo && promo.isActive) {
      res.json({ id: promo.id, code: promo.code, rebate: promo.amount, description: promo.description, status: "Active" });
    } else {
      res.status(404).json({ message: "Promo code not found or inactive" });
    }
  });

  app.get("/api/promoCodes", async (req, res) => {
    const code = req.query.code as string;
    if (code) {
      const promo = await storage.getPromoCodeByCode(code);
      if (!promo || !promo.isActive) {
        return res.status(404).json({ message: "Invalid or inactive promo code" });
      }
      return res.json({ rebate: promo.amount, code: promo.code });
    }

    const codes = await storage.getPromoCodes();
    res.json(codes);
  });

  app.post("/api/promoCodes", async (req, res) => {
    const parsed = insertPromoCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid promo code data" });
    }

    // Validation: Rebate capped at $1000
    if (parsed.data.amount > 1000) {
      return res.status(400).json({ message: "Rebate capped at $1000" });
    }
    
    // Check if code already exists
    const existing = await storage.getPromoCodeByCode(parsed.data.code);
    if (existing) {
      return res.status(409).json({ message: "Promo code already exists" });
    }

    const promo = await storage.createPromoCode(parsed.data);
    res.status(201).json(promo);
  });

  app.put("/api/promoCodes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const parsed = insertPromoCodeSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid update data" });
    }

    // Validation: Rebate capped at $1000
    if (parsed.data.amount !== undefined && parsed.data.amount > 1000) {
      return res.status(400).json({ message: "Rebate capped at $1000" });
    }

    const updated = await storage.updatePromoCode(id, parsed.data);
    if (!updated) return res.status(404).json({ message: "Promo code not found" });

    res.json(updated);
  });

  app.delete("/api/promoCodes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const success = await storage.deletePromoCode(id);
    if (!success) return res.status(404).json({ message: "Promo code not found" });

    res.status(204).send();
  });

  return httpServer;
}
