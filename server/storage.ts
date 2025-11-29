import { type User, type InsertUser, type PromoCode, type InsertPromoCode } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(id: number): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private promoCodes: Map<number, PromoCode>;
  private promoCodeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.promoCodes = new Map();
    this.promoCodeIdCounter = 1;

    // Initialize default promo codes
    this.initDefaults();
  }

  private initDefaults() {
    const defaults = [
      { code: "Switch2Electric", amount: 500, description: "Rebate for switching to electric heat pump", isActive: true },
      { code: "IAQBundle", amount: 750, description: "Indoor Air Quality package discount", isActive: true },
      { code: "FastTrack", amount: 500, description: "Expedited installation discount", isActive: true },
      { code: "FullSystem", amount: 1000, description: "Complete system replacement rebate", isActive: true },
    ];

    defaults.forEach(d => {
      const id = this.promoCodeIdCounter++;
      this.promoCodes.set(id, { ...d, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values());
  }

  async getPromoCode(id: number): Promise<PromoCode | undefined> {
    return this.promoCodes.get(id);
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(
      p => p.code.toUpperCase() === code.toUpperCase()
    );
  }

  async createPromoCode(insertPromo: InsertPromoCode): Promise<PromoCode> {
    const id = this.promoCodeIdCounter++;
    const promo: PromoCode = { 
      ...insertPromo, 
      id, 
      description: insertPromo.description ?? "", 
      isActive: insertPromo.isActive ?? true 
    };
    this.promoCodes.set(id, promo);
    return promo;
  }

  async updatePromoCode(id: number, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const existing = this.promoCodes.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.promoCodes.set(id, updated);
    return updated;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    return this.promoCodes.delete(id);
  }
}

export const storage = new MemStorage();
