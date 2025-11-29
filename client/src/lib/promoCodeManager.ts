import { type PromoCode, type InsertPromoCode } from "@shared/schema";
import { apiRequest } from "./queryClient";

// API Functions for React Query

export async function fetchPromoCodes(): Promise<PromoCode[]> {
  const res = await fetch("/api/promoCodes");
  if (!res.ok) throw new Error("Failed to fetch promo codes");
  return res.json();
}

export async function createPromoCode(promo: InsertPromoCode): Promise<PromoCode> {
  const res = await apiRequest("POST", "/api/promoCodes", promo);
  return res.json();
}

export async function updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode> {
  const res = await apiRequest("PUT", `/api/promoCodes/${id}`, promo);
  return res.json();
}

export async function deletePromoCode(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/promoCodes/${id}`);
}

export async function togglePromoStatus(id: number, isActive: boolean): Promise<PromoCode> {
  return updatePromoCode(id, { isActive });
}

// Helper for client-side lookup
export function findRebateAmount(codes: PromoCode[], codeToFind: string): number {
  if (!codeToFind) return 0;
  
  const normalizedInput = codeToFind.toUpperCase().replace(/\s+/g, '');
  
  const found = codes.find(p => 
    p.code.toUpperCase().replace(/\s+/g, '') === normalizedInput && p.isActive
  );
  
  return found ? found.amount : 0;
}
