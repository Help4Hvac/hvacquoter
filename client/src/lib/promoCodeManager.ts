
export interface PromoCode {
  code: string;
  amount: number;
  description: string;
  isActive: boolean;
}

// Initial Promo Codes
const DEFAULT_CODES: Record<string, PromoCode> = {
  "Switch2Electric": {
    code: "Switch2Electric",
    amount: 500,
    description: "Rebate for switching to electric heat pump",
    isActive: true
  },
  "IAQBundle": {
    code: "IAQBundle",
    amount: 750,
    description: "Indoor Air Quality package discount",
    isActive: true
  },
  "FastTrack": {
    code: "FastTrack",
    amount: 500,
    description: "Expedited installation discount",
    isActive: true
  },
  "FullSystem": {
    code: "FullSystem",
    amount: 1000,
    description: "Complete system replacement rebate",
    isActive: true
  }
};

// In-memory store
let promoCodes: Record<string, PromoCode> = { ...DEFAULT_CODES };

const MAX_REBATE = 1000;

/**
 * Normalizes the code for case-insensitive lookup
 */
const normalizeCode = (code: string): string => {
  return code.toUpperCase().replace(/\s+/g, '');
};

/**
 * Returns rebate amount if code exists and is active, else 0
 */
export const getRebate = (code: string): number => {
  if (!code) return 0;
  
  const normalizedInput = normalizeCode(code);
  
  for (const key of Object.keys(promoCodes)) {
    if (normalizeCode(key) === normalizedInput) {
      const promo = promoCodes[key];
      if (promo.isActive) {
        return promo.amount;
      }
    }
  }
  
  return 0;
};

/**
 * Adds new promo code
 */
export const addPromoCode = (code: string, amount: number, description: string = ""): void => {
  if (!code) return;
  // Check if exists
  const normalizedInput = normalizeCode(code);
  const existingKey = Object.keys(promoCodes).find(k => normalizeCode(k) === normalizedInput);
  
  if (existingKey) {
    // If exists, just update it? Or throw error? For simplicity, let's update.
    updatePromoCode(existingKey, amount, description);
    return;
  }

  const cappedAmount = Math.min(Math.max(0, amount), MAX_REBATE);
  promoCodes[code] = {
    code,
    amount: cappedAmount,
    description,
    isActive: true
  };
};

/**
 * Deletes code
 */
export const removePromoCode = (code: string): void => {
  if (!code) return;
  
  const normalizedInput = normalizeCode(code);
  const keyToDelete = Object.keys(promoCodes).find(k => normalizeCode(k) === normalizedInput);
  
  if (keyToDelete) {
    delete promoCodes[keyToDelete];
  }
};

/**
 * Edits rebate amount and description
 */
export const updatePromoCode = (code: string, amount: number, description?: string): void => {
  const normalizedInput = normalizeCode(code);
  const existingKey = Object.keys(promoCodes).find(k => normalizeCode(k) === normalizedInput);
  
  if (existingKey) {
    const cappedAmount = Math.min(Math.max(0, amount), MAX_REBATE);
    promoCodes[existingKey] = {
      ...promoCodes[existingKey],
      amount: cappedAmount,
      description: description !== undefined ? description : promoCodes[existingKey].description
    };
  }
};

/**
 * Toggles active status
 */
export const togglePromoStatus = (code: string): void => {
  const normalizedInput = normalizeCode(code);
  const existingKey = Object.keys(promoCodes).find(k => normalizeCode(k) === normalizedInput);
  
  if (existingKey) {
    promoCodes[existingKey] = {
      ...promoCodes[existingKey],
      isActive: !promoCodes[existingKey].isActive
    };
  }
};

/**
 * Get all codes for admin dashboard
 */
export const getAllPromoCodes = (): PromoCode[] => {
  return Object.values(promoCodes);
};
