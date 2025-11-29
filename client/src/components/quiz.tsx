import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Flame, AlertTriangle, DollarSign, Thermometer, Zap, CheckCircle2, Building2, Building, Box, Settings2, Gauge, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ranchImage from "@assets/generated_images/single_story_ranch_house_exterior.png";
import twoStoryImage from "@assets/generated_images/two_story_colonial_house_exterior.png";
import townhouseImage from "@assets/generated_images/modern_townhouse_row_exterior.png";
import condoImage from "@assets/generated_images/modern_condo_building_exterior.png";
import hvacImage from "@assets/generated_images/modern_clean_hvac_unit_in_utility_room.png";
import familyImage from "@assets/generated_images/happy_family_relaxing_on_couch_comfort.png";
import heroImage from "@assets/generated_images/modern_bright_living_room_with_subtle_hvac_vent.png";
import splitImage from "@assets/generated_images/real_residential_hvac_split_system_outdoor_and_indoor_units.png";
import packageImage from "@assets/generated_images/real_ameristar_residential_hvac_package_unit.png";
import gasPackImage from "@assets/generated_images/real_residential_hvac_gas_pack_unit_with_gas_line.png";


interface QuizProps {
  onComplete: (data: any) => void;
}

const steps = [
  {
    id: "systemType",
    question: "What type of HVAC system do you currently have?",
    image: splitImage,
    options: [
      { id: "split", label: "Split System (Outdoor Unit + Indoor Unit)", icon: Settings2, image: splitImage },
      { id: "package", label: "Package Unit (Single Large Outdoor Unit)", icon: Box, image: packageImage },
      { id: "gaspack", label: "Gas Pack (Gas Heat + Electric Cooling)", icon: Gauge, image: gasPackImage },
    ],
    layout: "grid",
  },
  {
    id: "type",
    question: "What type of house do you have?",
    image: ranchImage,
    options: [
      { id: "ranch", label: "Ranch House", icon: Home, image: ranchImage },
      { id: "two-story", label: "Two-Story House", icon: Building, image: twoStoryImage },
      { id: "townhouse", label: "Townhouse", icon: Building2, image: townhouseImage },
      { id: "condo", label: "Condo", icon: Building2, image: condoImage },
    ],
    layout: "grid", 
  },
  {
    id: "size",
    question: "What size system do you need?",
    image: heroImage,
    options: [
      { id: "2ton", label: "2 Ton (1000-1200 sq ft)", icon: Home },
      { id: "3ton", label: "3 Ton (1200-1800 sq ft)", icon: Home },
      { id: "4ton", label: "4 Ton (1800-2400 sq ft)", icon: Home },
      { id: "5ton", label: "5 Ton (2400-3000 sq ft)", icon: Home },
    ],
    layout: "list",
  },
  {
    id: "currentSystem",
    question: "What is your heating source?",
    image: hvacImage,
    options: [
      { id: "furnace", label: "Gas Furnace", icon: Flame },
      { id: "heatpump", label: "Electric Heat Pump", icon: Zap },
      { id: "boiler", label: "Boiler / Radiators", icon: Thermometer },
      { id: "unknown", label: "I'm not sure", icon: AlertTriangle },
    ],
    layout: "list",
  },
  {
    id: "issue",
    question: "What is the main reason you're looking to replace?",
    image: heroImage,
    options: [
      { id: "broken", label: "System is broken", icon: AlertTriangle },
      { id: "old", label: "System is old (10+ years)", icon: CheckCircle2 },
      { id: "bills", label: "High energy bills", icon: DollarSign },
      { id: "comfort", label: "Uneven temperatures", icon: Thermometer },
    ],
    layout: "list",
  },
  {
    id: "priority",
    question: "What is most important to you for the new system?",
    image: familyImage,
    options: [
      { id: "budget", label: "Lowest Upfront Cost", icon: DollarSign },
      { id: "value", label: "Best Value (Cost vs. Performance)", icon: CheckCircle2 },
      { id: "performance", label: "Maximum Comfort & Efficiency", icon: Zap },
    ],
    layout: "list",
  },
  {
    id: "rebate",
    question: "Enter a promo code for rebates or discounts",
    image: familyImage,
    type: "input",
    options: [], 
    layout: "center"
  }
];

export function Quiz({ onComplete }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(0);
  const [rebateInput, setRebateInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [steps[currentStep].id]: value };
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setDirection(1);
      setTimeout(() => setCurrentStep((prev) => prev + 1), 250);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleRebateSubmit = async () => {
    const value = rebateInput.trim();
    
    if (!value) {
      handleSelect("");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(`/api/promoCodes?code=${encodeURIComponent(value)}`);
      
      if (!response.ok) {
        throw new Error("Invalid promo code");
      }

      const data = await response.json();
      
      toast({
        title: "Promo Code Applied!",
        description: `Code validated! Includes a $${data.rebate} rebate.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Pass the validated code
      handleSelect(value);
      
    } catch (error) {
      toast({
        title: "Invalid Code",
        description: "This promo code is either invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="w-full max-w-6xl mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50 grid md:grid-cols-2 min-h-[500px]">
      {/* Image Side */}
      <div className="relative h-48 md:h-auto overflow-hidden hidden md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img 
              src={step.image} 
              alt="Step Context" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />
            
            {/* Step Indicator Overlay */}
            <div className="absolute bottom-6 left-6 text-white">
               <p className="text-sm font-medium opacity-90 tracking-wider uppercase mb-1">Step {currentStep + 1} of {steps.length}</p>
               <div className="flex gap-2 mt-2">
                 {steps.map((_, i) => (
                   <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? "w-8 bg-accent" : i < currentStep ? "w-2 bg-white" : "w-2 bg-white/30"}`} 
                   />
                 ))}
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Question Side */}
      <div className="p-6 md:p-12 flex flex-col justify-center bg-card overflow-y-auto max-h-[80vh] md:max-h-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-8 leading-tight">
              {step.question}
            </h2>

            {step.type === 'input' ? (
               <div className="space-y-6">
                 <div className="relative">
                   <Tag className="absolute left-3 top-3 text-muted-foreground" />
                   <Input 
                    type="text" 
                    placeholder="Enter promo code (e.g. FullSystem)" 
                    className="pl-10 h-12 text-lg"
                    value={rebateInput}
                    onChange={(e) => setRebateInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRebateSubmit()}
                   />
                 </div>
                 <p className="text-sm text-muted-foreground">
                   If you have a promo code for a rebate or discount, enter it above. We'll apply it to your estimate.
                 </p>
                 <div className="flex gap-4">
                   <Button 
                    onClick={() => handleSelect("")} 
                    variant="outline" 
                    className="flex-1 h-12 text-base"
                    disabled={isValidating}
                   >
                     I don't have one
                   </Button>
                   <Button 
                    onClick={handleRebateSubmit} 
                    className="flex-1 h-12 text-base bg-accent hover:bg-accent/90"
                    disabled={!rebateInput || isValidating}
                   >
                     {isValidating ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Validating...
                       </>
                     ) : (
                       "Apply Code"
                     )}
                   </Button>
                 </div>
               </div>
            ) : (
              <div className={`grid gap-4 ${step.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {step.options.map((option) => {
                  const Icon = option.icon;
                  const isSelected = answers[step.id] === option.id;
                  
                  if (step.layout === 'grid' && 'image' in option) {
                    // Card style for house types
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`
                          group relative flex flex-col items-center text-center p-0 rounded-xl border-2 overflow-hidden transition-all duration-200 h-full
                          ${isSelected 
                            ? "border-accent ring-1 ring-accent" 
                            : "border-border hover:border-primary/50 hover:shadow-md"}
                        `}
                        data-testid={`quiz-option-${option.id}`}
                      >
                        <div className="w-full h-32 overflow-hidden">
                          <img src={option.image} alt={option.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        <div className={`w-full p-4 ${isSelected ? "bg-accent text-white" : "bg-card text-foreground"}`}>
                          <span className="font-semibold text-sm md:text-base block">
                            {option.label}
                          </span>
                        </div>
                      </button>
                    );
                  }

                  // List style for other questions
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`
                        group relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${isSelected 
                          ? "border-accent bg-accent/5 ring-1 ring-accent" 
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"}
                      `}
                      data-testid={`quiz-option-${option.id}`}
                    >
                      <div className={`
                        p-3 rounded-lg transition-colors duration-200
                        ${isSelected ? "bg-accent text-white" : "bg-secondary text-muted-foreground group-hover:text-primary"}
                      `}>
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className={`font-semibold text-lg block ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
