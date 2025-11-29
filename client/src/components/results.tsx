import { motion } from "framer-motion";
import { Check, Info, Star, Zap, ShieldCheck, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResultsProps {
  onSelect: (tier: string) => void;
  quizData: Record<string, string>;
}

// Pricing Data Lookup Table
// Keys: brand -> size -> tier -> [priceRange, monthly]
const PRICING_DATA: Record<string, Record<string, { silver: string[], gold: string[], platinum: string[] }>> = {
  ameristar: {
    '2ton': { silver: ["$7,500 - $8,500", "$105/mo"], gold: ["$9,000 - $10,000", "$135/mo"], platinum: ["$11,000 - $12,000", "$165/mo"] },
    '3ton': { silver: ["$8,500 - $9,500", "$125/mo"], gold: ["$10,500 - $11,500", "$165/mo"], platinum: ["$12,500 - $13,500", "$195/mo"] },
    '4ton': { silver: ["$11,000 - $12,000", "$155/mo"], gold: ["$13,000 - $14,500", "$195/mo"], platinum: ["$15,000 - $17,000", "$235/mo"] },
    '5ton': { silver: ["$12,500 - $13,500", "$175/mo"], gold: ["$14,500 - $16,000", "$215/mo"], platinum: ["$16,500 - $18,500", "$255/mo"] }, // Extrapolated +1.5k from 4ton
  },
  amstd: {
    '2ton': { silver: ["$9,500 - $10,500", "$145/mo"], gold: ["$11,000 - $12,500", "$175/mo"], platinum: ["$13,000 - $14,500", "$205/mo"] },
    '3ton': { silver: ["$10,500 - $11,500", "$165/mo"], gold: ["$12,500 - $13,500", "$195/mo"], platinum: ["$14,500 - $16,000", "$225/mo"] },
    '4ton': { silver: ["$13,000 - $14,500", "$195/mo"], gold: ["$15,000 - $16,500", "$235/mo"], platinum: ["$17,000 - $19,000", "$275/mo"] }, // Extrapolated +2.5k from 3ton
    '5ton': { silver: ["$14,500 - $16,000", "$215/mo"], gold: ["$16,500 - $18,500", "$255/mo"], platinum: ["$19,000 - $21,500", "$295/mo"] }, // Extrapolated +1.5k from 4ton
  }
};

const getPricing = (priority: string, size: string) => {
  const isBudget = priority === 'budget';
  const brand = isBudget ? 'ameristar' : 'amstd';
  
  // Normalize size input or default to 3ton if undefined
  let normalizedSize = size || '3ton';
  if (!PRICING_DATA[brand][normalizedSize]) {
    normalizedSize = '3ton'; // Fallback
  }

  const data = PRICING_DATA[brand][normalizedSize];

  return {
    silver: { range: data.silver[0], monthly: data.silver[1] },
    gold: { range: data.gold[0], monthly: data.gold[1] },
    platinum: { range: data.platinum[0], monthly: data.platinum[1] }
  };
};

export function Results({ onSelect, quizData }: ResultsProps) {
  const priority = quizData.priority || 'value'; // Default to value if missing
  const size = quizData.size || '3ton'; // Default to 3ton if missing
  const pricing = getPricing(priority, size);
  
  // Calculate display text for sizing context
  const sizeDisplay = size.replace('ton', ' Ton');

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
            Based on your home size ({sizeDisplay}) and preference for <strong>{priority === 'budget' ? 'lowest upfront cost' : priority === 'value' ? 'best value' : 'maximum performance'}</strong>, here are our recommended installation packages.
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
