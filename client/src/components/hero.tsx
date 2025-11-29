import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Phone, Shield, Clock } from "lucide-react";
import heroImage from "@assets/generated_images/modern_bright_living_room_with_subtle_hvac_vent.png";

interface HeroProps {
  onStartQuiz: () => void;
}

export function Hero({ onStartQuiz }: HeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Comfortable modern home" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
            <div className="flex text-accent">
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
            </div>
            <span className="text-sm font-medium text-white/90">Top Rated HVAC in Your Area</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-extrabold leading-[1.1] tracking-tight">
            Transparent HVAC Quotes in <span className="text-accent">Seconds.</span>
          </h1>
          
          <p className="text-xl text-slate-200 leading-relaxed max-w-lg">
            Stop guessing what a new system costs. Answer 4 simple questions and get instant Good, Better, Best pricing options. No sales pressure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={onStartQuiz}
              size="lg" 
              className="h-16 px-8 text-lg font-bold bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 transition-transform hover:scale-105"
              data-testid="hero-start-quiz"
            >
              Get My Instant Quote <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 px-8 text-lg font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Phone className="mr-2 w-5 h-5" /> (800) 555-0199
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-8 text-sm font-medium text-slate-300/80">
            <div className="flex items-center gap-2">
               <Shield className="w-5 h-5 text-accent" /> Licensed & Insured
            </div>
            <div className="flex items-center gap-2">
               <Clock className="w-5 h-5 text-accent" /> Same-Day Service
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
