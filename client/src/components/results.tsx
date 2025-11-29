import { motion } from "framer-motion";
import { Check, Info, Star, Zap, ShieldCheck, ThermometerSun, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchPromoCodes, findRebateAmount } from "@/lib/promoCodeManager";

interface ResultsProps {
  onSelect: (tier: string) => void;
  quizData: Record<string, string>;
}

// --- Configuration ---
const MARGIN = 0.55; // 55% Margin

// Labor/Overhead costs
const COST_LABOR_SMALL = 1000; // 2-3 Ton
const COST_LABOR_LARGE = 1200; // 4-5 Ton

// Tier Offsets (Added to Silver Retail)
const OFFSET_GOLD_MIN = 1500;
const OFFSET_GOLD_MAX = 2000;
const OFFSET_PLATINUM_MIN = 3000;
const OFFSET_PLATINUM_MAX = 4000;

interface SystemData {
  sku: string;
  cost: number;
}

// --- Dealer Cost Data with SKUs ---
// Structure: Brand -> SystemType -> Size -> { sku, cost }
const DEALER_COSTS: Record<string, Record<string, Record<string, SystemData>>> = {
  ameristar: {
    split: {
      '2ton': { sku: 'A5HP4024A1000A + A5AHC002A1B30A', cost: 3431 },
      '3ton': { sku: 'A5HP4036A1000A + A5AHC004A1D30A', cost: 3768 },
      '4ton': { sku: 'A5HP4048A1000A + A5AHC006A1D30A', cost: 4598 },
      '5ton': { sku: 'A5HP4060A1000A + A5AHC007A1D30A', cost: 4900 },
    },
    package: {
      '2ton': { sku: 'A5PH3024A1000A', cost: 4200 },
      '3ton': { sku: 'A5PH3036A1000A', cost: 4600 },
      '4ton': { sku: 'A5PH3048A1000A', cost: 5400 },
      '5ton': { sku: 'A5PH3060A1000A', cost: 5800 },
    },
    gaspack: {
      '2ton': { sku: 'A5PG3024A1060A', cost: 4500 },
      '3ton': { sku: 'A5PG3036A1070A', cost: 4900 },
      '4ton': { sku: 'A5PG3048A1090A', cost: 5700 },
      '5ton': { sku: 'A5PG3060A1115A', cost: 6100 },
    }
  },
  amstd: {
    split: {
      '2ton': { sku: '5A6H4024A1000A + 5TEM4B02AC21SA', cost: 5146 },
      '3ton': { sku: '5A6H4036A1000A + 5TEM4D04AC31SA', cost: 5673 },
      '4ton': { sku: '5A6H4048A1000A + 5TEM4D06AC41SA', cost: 6800 },
      '5ton': { sku: '5A6H4060A1000A + 5TEM4D07AC51SA', cost: 7200 },
    },
    package: {
      '2ton': { sku: '5WCC4024A1000A', cost: 6200 },
      '3ton': { sku: '5WCC4036A1000A', cost: 6800 },
      '4ton': { sku: '5WCC4048A1000A', cost: 7900 },
      '5ton': { sku: '5WCC4060A1000A', cost: 8400 },
    },
    gaspack: {
      '2ton': { sku: '5YCC4024A1060A', cost: 6600 },
      '3ton': { sku: '5YCC4036A1070A', cost: 7200 },
      '4ton': { sku: '5YCC4048A1090A', cost: 8300 },
      '5ton': { sku: '5YCC4060A1115A', cost: 8800 },
    }
  }
};

// --- Calculation Logic ---

const calculateRetail = (dealerCost: number, size: string) => {
  // Determine Labor/Overhead based on size
  const laborOverhead = (size === '2ton' || size === '3ton') ? COST_LABOR_SMALL : COST_LABOR_LARGE;
  
  // Formula: Retail = (Dealer Cost + Labor/Overhead) / (1 - TargetMargin)
  const baseRetail = (dealerCost + laborOverhead) / (1 - MARGIN);
  
  // Round to nearest 100 for cleaner pricing
  return Math.ceil(baseRetail / 100) * 100;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const getPricing = (priority: string, size: string, systemType: string, rebate: number) => {
  const isBudget = priority === 'budget';
  const brand = isBudget ? 'ameristar' : 'amstd';
  
  // Normalize inputs
  let normalizedSize = size || '3ton';
  let normalizedSystemType = 'split'; 
  
  if (systemType && systemType.includes('package')) {
    normalizedSystemType = 'package';
  }
  if (systemType && systemType.includes('gaspack')) {
    normalizedSystemType = 'gaspack';
  }

  // Fallback for cost if not found
  if (!DEALER_COSTS[brand]?.[normalizedSystemType]?.[normalizedSize]) {
    console.warn(`Pricing data missing for ${brand} ${normalizedSystemType} ${normalizedSize}, using fallback.`);
    normalizedSize = '3ton';
    // Ensure we have a valid fallback path if systemType is totally unknown
    if (!DEALER_COSTS[brand][normalizedSystemType]) {
       normalizedSystemType = 'split';
    }
  }

  const systemData = DEALER_COSTS[brand][normalizedSystemType][normalizedSize];
  const dealerCost = systemData.cost;
  
  // Calculate Silver Base Price
  const baseSilverPrice = calculateRetail(dealerCost, normalizedSize);
  
  // Calculate Gold Range
  const baseGoldMin = baseSilverPrice + OFFSET_GOLD_MIN;
  const baseGoldMax = baseSilverPrice + OFFSET_GOLD_MAX;
  
  // Calculate Platinum Range
  const basePlatinumMin = baseSilverPrice + OFFSET_PLATINUM_MIN;
  const basePlatinumMax = baseSilverPrice + OFFSET_PLATINUM_MAX;
  
  // Apply Rebate Logic (Cost Floor Check)
  // Formula: AdjustedRetail = Max(Retail - Min(Rebate, 1000), DealerCost)
  
  const applyRebate = (retailPrice: number, rebateAmount: number) => {
    const cappedRebate = Math.min(rebateAmount, 1000);
    return Math.max(retailPrice - cappedRebate, dealerCost);
  };

  const silverPrice = applyRebate(baseSilverPrice, rebate);
  
  // Gold & Platinum use offset from ADJUSTED Silver (based on user request interpretation: "Gold = Silver + Offset")
  // However, typical pricing logic usually adds offset to base then rebates. 
  // User request says: "Gold = Silver + $1,500–$2,000 - rebate" -> wait, "Silver = Final Price" (which is already rebated).
  // User formula: "Gold = Silver + $1,500... - rebate" -> This would double dip rebate if Silver is already rebated?
  // Let's re-read carefully: "Silver = Final Price" (which is `retail - rebate`).
  // "Gold = Silver + 1500 - rebate".
  // If Silver is already rebated, then Gold = (Retail - Rebate) + 1500 - Rebate. That subtracts rebate twice.
  // LIKELY INTENT: Gold = (BaseSilver + 1500) - Rebate.
  // Which is what I have below: calculate base, then apply rebate function.
  
  const goldMin = applyRebate(baseSilverPrice + OFFSET_GOLD_MIN, rebate);
  const goldMax = applyRebate(baseSilverPrice + OFFSET_GOLD_MAX, rebate);
  
  // Platinum = Silver * 1.25
  const platinumPrice = Math.round(silverPrice * 1.25);

  
  // Monthly Estimates (approx 1.5% of total)
  const getMonthly = (total: number) => Math.round(total * 0.015);

  return {
    silver: { 
      price: silverPrice,
      range: `${formatCurrency(silverPrice)} - ${formatCurrency(silverPrice + 500)}`, 
      monthly: `$${getMonthly(silverPrice)}/mo` 
    },
    gold: { 
      price: goldMin,
      range: `${formatCurrency(goldMin)} - ${formatCurrency(goldMax)}`, 
      monthly: `$${getMonthly(goldMin)}/mo` 
    },
    platinum: { 
      price: platinumPrice,
      range: `${formatCurrency(platinumPrice)} - ${formatCurrency(platinumPrice + 500)}`, 
      monthly: `$${getMonthly(platinumPrice)}/mo` 
    },
    rebateApplied: rebate
  };
};

export function Results({ onSelect, quizData }: ResultsProps) {
  const priority = quizData.priority || 'value';
  const size = quizData.size || '3ton';
  const systemType = quizData.systemType || 'split'; 
  const promoCode = (quizData.rebate || "").trim();
  
  // Fetch promo codes from API
  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["promoCodes"],
    queryFn: fetchPromoCodes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Lookup Rebate from API Data
  let rebate = findRebateAmount(codes, promoCode);

  const pricing = getPricing(priority, size, systemType, rebate);
  
  const sizeDisplay = size.replace('ton', ' Ton');
  let systemDisplay = 'Split System';
  if (systemType === 'package') systemDisplay = 'Package Unit';
  if (systemType === 'gaspack') systemDisplay = 'Gas Pack';

  const tiers = [
    {
      id: "good",
      name: "Silver Comfort",
      tagline: "Reliable performance on a budget",
      priceRange: pricing.silver.range,
      monthly: `Starting at ${pricing.silver.monthly}`,
      efficiency: "14 SEER2",
      warranty: "10-Year Parts",
      features: [
        "Single-Stage Compressor",
        "Standard Sound Levels",
        "Standard Air Filtration",
        "Smart Thermostat Compatible",
      ],
      color: "bg-slate-100",
      borderColor: "border-slate-200",
      buttonColor: "bg-slate-800 hover:bg-slate-900",
      recommended: false,
    },
    {
      id: "better",
      name: "Gold Efficiency",
      tagline: "Perfect balance of comfort & savings",
      priceRange: pricing.gold.range,
      monthly: `Starting at ${pricing.gold.monthly}`,
      efficiency: "16 SEER2",
      warranty: "10-Year Parts + 2-Year Labor",
      features: [
        "Two-Stage Compressor (Even Temps)",
        "Quiet Operation Technology",
        "Enhanced Humidity Control",
        "Wi-Fi Smart Thermostat Included",
      ],
      color: "bg-white",
      borderColor: "border-accent",
      buttonColor: "bg-accent hover:bg-accent/90",
      recommended: true,
    },
    {
      id: "best",
      name: "Platinum Elite",
      tagline: "Ultimate precision and silence",
      priceRange: pricing.platinum.range,
      monthly: `Starting at ${pricing.platinum.monthly}`,
      efficiency: "20+ SEER2",
      warranty: "Lifetime Unit Replacement",
      features: [
        "Variable Speed Compressor (Inverter)",
        "Whisper-Quiet Operation",
        "Perfect Humidity & Air Quality",
        "Communicating Smart Zoning Ready",
      ],
      color: "bg-slate-50",
      borderColor: "border-primary/20",
      buttonColor: "bg-primary hover:bg-primary/90",
      recommended: false,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
            Your Custom Comfort Solutions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
            Based on your <strong>{systemDisplay}</strong> ({sizeDisplay}) and preference for <strong>{priority === 'budget' ? 'lowest upfront cost' : priority === 'value' ? 'best value' : 'maximum performance'}</strong>, here are our recommended installation packages.
          </p>
          {pricing.rebateApplied > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-1 text-base font-medium">
               <Tag className="w-4 h-4 mr-2 inline-block" />
               Includes ${pricing.rebateApplied} rebate from promo code: {promoCode}
            </Badge>
          )}
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            {tier.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-accent hover:bg-accent text-white px-4 py-1 text-sm font-bold shadow-md uppercase tracking-wide">
                  Most Popular Choice
                </Badge>
              </div>
            )}
            
            <Card className={`h-full flex flex-col border-2 shadow-xl transition-all duration-300 hover:shadow-2xl ${tier.recommended ? `border-accent shadow-accent/10 scale-105 z-10` : `${tier.borderColor}`}`}>
              <CardHeader className={`${tier.color} rounded-t-lg pb-8`}>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold font-heading text-primary">{tier.name}</h3>
                  <p className="text-muted-foreground font-medium text-sm">{tier.tagline}</p>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-foreground">{tier.priceRange}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{tier.monthly}</div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pt-6">
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/50 p-3 rounded-lg text-center">
                       <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
                       <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Efficiency</div>
                       <div className="font-bold text-foreground">{tier.efficiency}</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg text-center">
                       <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-primary" />
                       <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Warranty</div>
                       <div className="font-bold text-foreground text-sm leading-tight pt-1">{tier.warranty}</div>
                    </div>
                 </div>

                 <ul className="space-y-3">
                   {tier.features.map((feature, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm">
                       <div className={`mt-0.5 rounded-full p-0.5 ${tier.recommended ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"}`}>
                         <Check className="w-3 h-3" strokeWidth={3} />
                       </div>
                       <span className="text-foreground/80">{feature}</span>
                     </li>
                   ))}
                 </ul>
              </CardContent>

              <CardFooter className="pt-4 pb-8">
                <Button 
                  className={`w-full h-12 text-base font-bold shadow-lg transition-all ${tier.buttonColor}`}
                  onClick={() => onSelect(tier.id)}
                  data-testid={`select-tier-${tier.id}`}
                >
                  Select {tier.name}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
