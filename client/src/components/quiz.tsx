import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Home, Flame, AlertTriangle, DollarSign, Thermometer, Zap, CheckCircle2 } from "lucide-react";

import houseImage from "@assets/generated_images/modern_suburban_house_exterior_sunny_day.png";
import hvacImage from "@assets/generated_images/modern_clean_hvac_unit_in_utility_room.png";
import familyImage from "@assets/generated_images/happy_family_relaxing_on_couch_comfort.png";
import heroImage from "@assets/generated_images/modern_bright_living_room_with_subtle_hvac_vent.png";

interface QuizProps {
  onComplete: (data: any) => void;
}

const steps = [
  {
    id: "size",
    question: "What is the approximate size of your home?",
    image: houseImage,
    options: [
      { id: "small", label: "Under 1,500 sq ft", icon: Home },
      { id: "medium", label: "1,500 - 2,500 sq ft", icon: Home },
      { id: "large", label: "Over 2,500 sq ft", icon: Home },
    ],
  },
  {
    id: "system",
    question: "What type of system do you currently have?",
    image: hvacImage,
    options: [
      { id: "furnace", label: "Gas Furnace & AC", icon: Flame },
      { id: "heatpump", label: "Electric Heat Pump", icon: Zap },
      { id: "boiler", label: "Boiler / Radiators", icon: Thermometer },
      { id: "unknown", label: "I'm not sure", icon: AlertTriangle },
    ],
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
  },
];

export function Quiz({ onComplete }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(0);

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

  const step = steps[currentStep];

  return (
    <div className="w-full max-w-6xl mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50 grid md:grid-cols-2 min-h-[500px]">
      {/* Image Side */}
      <div className="relative h-48 md:h-auto overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.image}
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
      <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-heading font-bold text-primary mb-8 leading-tight">
              {step.question}
            </h2>

            <div className="grid gap-4">
              {step.options.map((option) => {
                const Icon = option.icon;
                const isSelected = answers[step.id] === option.id;
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
