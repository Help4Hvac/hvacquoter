
// Initial Promo Codes
const DEFAULT_CODES: Record<string, number> = {
  "Switch2Electric": 500,
  "IAQBundle": 750,
  "FastTrack": 500,
  "FullSystem": 1000
};

// In-memory store (initialized with defaults)
// Note: In a real app, this might come from an API or persistent store.
// Since we are in a frontend prototype, we'll just use a module-level variable
// which persists as long as the page/module isn't reloaded.
let promoCodes: Record<string, number> = { ...DEFAULT_CODES };

const MAX_REBATE = 1000;

/**
 * Normalizes the code for case-insensitive lookup
 */
const normalizeCode = (code: string): string => {
  return code.toUpperCase().replace(/\s+/g, '');
};

/**
 * Returns rebate amount if code exists, else 0
 */
export const getRebate = (code: string): number => {
  if (!code) return 0;
  
  // We need to check against normalized keys
  // To support case-insensitivity, we iterate or maintain a normalized map.
  // For simplicity with the requirement to store exact keys in JSON,
  // we'll normalize the input and check against normalized keys of our store.
  
  const normalizedInput = normalizeCode(code);
  
  for (const key of Object.keys(promoCodes)) {
    if (normalizeCode(key) === normalizedInput) {
      return promoCodes[key];
    }
  }
  
  return 0;
};

/**
 * Adds new code (cap at $1000)
 */
export const addPromoCode = (code: string, amount: number): void => {
  if (!code) return;
  const cappedAmount = Math.min(Math.max(0, amount), MAX_REBATE);
  promoCodes[code] = cappedAmount;
};

/**
 * Deletes code
 */
export const removePromoCode = (code: string): void => {
  if (!code) return;
  
  // Find the exact key to delete
  const normalizedInput = normalizeCode(code);
  const keyToDelete = Object.keys(promoCodes).find(k => normalizeCode(k) === normalizedInput);
  
  if (keyToDelete) {
    delete promoCodes[keyToDelete];
  }
};

/**
 * Edits rebate amount (cap at $1000)
 */
export const updatePromoCode = (code: string, amount: number): void => {
  // This is essentially the same as add in this simple key-value store implementation
  // but implies the code should already exist.
  const normalizedInput = normalizeCode(code);
  const existingKey = Object.keys(promoCodes).find(k => normalizeCode(k) === normalizedInput);
  
  if (existingKey) {
    const cappedAmount = Math.min(Math.max(0, amount), MAX_REBATE);
    promoCodes[existingKey] = cappedAmount;
  }
};

/**
 * Debug/Testing utility to see current codes
 */
export const getAllPromoCodes = () => {
  return { ...promoCodes };
};
