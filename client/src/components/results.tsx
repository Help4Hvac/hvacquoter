import { motion } from "framer-motion";
import { Check, Info, Star, Zap, ShieldCheck, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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


// --- Dealer Cost Data (Mocked based on provided examples) ---
// Structure: Brand -> SystemType -> Size -> Cost
const DEALER_COSTS: Record<string, Record<string, Record<string, number>>> = {
  ameristar: {
    split: {
      '2ton': 3431, 
      '3ton': 3768, 
      '4ton': 4598, 
      '5ton': 4900, // Estimated
    },
    package: {
      '2ton': 4200, // Estimated 
      '3ton': 4600, // Estimated
      '4ton': 5400, // Estimated
      '5ton': 5800, // Estimated
    },
    gaspack: {
      '2ton': 4500, // Estimated premium over package
      '3ton': 4900, 
      '4ton': 5700, 
      '5ton': 6100,
    }
  },
  amstd: {
    split: {
      '2ton': 5146, 
      '3ton': 5673, 
      '4ton': 6800, // Estimated
      '5ton': 7200, // Estimated
    },
    package: {
      '2ton': 6200, // Estimated
      '3ton': 6800, // Estimated
      '4ton': 7900, // Estimated
      '5ton': 8400, // Estimated
    },
    gaspack: {
      '2ton': 6600, // Estimated premium over package
      '3ton': 7200, 
      '4ton': 8300, 
      '5ton': 8800,
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

const getPricing = (priority: string, size: string, systemType: string) => {
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

  const dealerCost = DEALER_COSTS[brand][normalizedSystemType][normalizedSize];
  
  // Calculate Silver Base Price
  const silverPrice = calculateRetail(dealerCost, normalizedSize);
  
  // Calculate Gold Range
  const goldMin = silverPrice + OFFSET_GOLD_MIN;
  const goldMax = silverPrice + OFFSET_GOLD_MAX;
  
  // Calculate Platinum Range
  const platinumMin = silverPrice + OFFSET_PLATINUM_MIN;
  const platinumMax = silverPrice + OFFSET_PLATINUM_MAX;
  
  // Monthly Estimates (approx 1.5% of total)
  const getMonthly = (total: number) => Math.round(total * 0.015);

  return {
    silver: { 
      range: `${formatCurrency(silverPrice)} - ${formatCurrency(silverPrice + 500)}`, 
      monthly: `$${getMonthly(silverPrice)}/mo` 
    },
    gold: { 
      range: `${formatCurrency(goldMin)} - ${formatCurrency(goldMax)}`, 
      monthly: `$${getMonthly(goldMin)}/mo` 
    },
    platinum: { 
      range: `${formatCurrency(platinumMin)} - ${formatCurrency(platinumMax)}`, 
      monthly: `$${getMonthly(platinumMin)}/mo` 
    }
  };
};

export function Results({ onSelect, quizData }: ResultsProps) {
  const priority = quizData.priority || 'value';
  const size = quizData.size || '3ton';
  const systemType = quizData.systemType || 'split'; 
  
  const pricing = getPricing(priority, size, systemType);
  
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
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Based on your <strong>{systemDisplay}</strong> ({sizeDisplay}) and preference for <strong>{priority === 'budget' ? 'lowest upfront cost' : priority === 'value' ? 'best value' : 'maximum performance'}</strong>, here are our recommended installation packages.
          </p>
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
