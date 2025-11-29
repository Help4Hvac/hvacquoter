import { useState, useRef } from "react";
import { Hero } from "@/components/hero";
import { Quiz } from "@/components/quiz";
import { Results } from "@/components/results";
import { LeadForm } from "@/components/lead-form";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const quizRef = useRef<HTMLDivElement>(null);

  const handleStartQuiz = () => {
    setHasStarted(true);
    setTimeout(() => {
      quizRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleQuizComplete = (data: any) => {
    console.log("Quiz Data:", data);
    setQuizCompleted(true);
  };

  const handleSelectTier = (tierId: string) => {
    const tierName = tierId === "good" ? "Silver Comfort" : tierId === "better" ? "Gold Efficiency" : "Platinum Elite";
    setSelectedTier(tierName);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation - Simplified/Unbranded initially */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 h-20 flex items-center">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Only show Branding IF quiz is completed */}
            {quizCompleted ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
                <span className="text-2xl font-heading font-bold text-primary tracking-tight">ComfortAir</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 opacity-80">
                 <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground font-bold text-xl">Q</div>
                 <span className="text-xl font-heading font-bold text-muted-foreground tracking-tight">Instant HVAC Quote</span>
              </div>
            )}
          </div>
          
          {quizCompleted && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="hidden md:flex items-center gap-8 font-medium text-foreground/80"
            >
              <a href="#" className="hover:text-primary transition-colors">Services</a>
              <a href="#" className="hover:text-primary transition-colors">Maintenance</a>
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
            </motion.div>
          )}

          {quizCompleted && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors text-sm"
            >
              Book Service
            </motion.button>
          )}
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {!quizCompleted && <Hero onStartQuiz={handleStartQuiz} />}

        <div ref={quizRef} className={`py-24 ${quizCompleted ? "bg-background" : "bg-secondary/30"} relative transition-colors duration-500`}>
           {/* Decoration */}
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
           
           <div className="container mx-auto px-4">
             {!quizCompleted ? (
               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                 <div className="text-center mb-12">
                   <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
                     Find Your Perfect System Match
                   </h2>
                   <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                     Answer a few questions about your home and preferences to get an instant, custom recommendation.
                   </p>
                 </div>
                 
                 <Quiz onComplete={handleQuizComplete} />
               </motion.div>
             ) : (
               <Results onSelect={handleSelectTier} />
             )}
           </div>
        </div>

        {/* Social Proof Section - Only show after quiz */}
        {quizCompleted && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="py-24 bg-white"
          >
            <div className="container mx-auto px-4 text-center">
               <h3 className="text-2xl font-heading font-bold text-primary mb-12">Trusted by 5,000+ Homeowners</h3>
               <div className="grid md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-secondary/20 p-8 rounded-2xl text-left">
                      <div className="flex text-accent mb-4">
                        {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
                      </div>
                      <p className="text-foreground/80 mb-6 italic">"The transparency of the pricing was amazing. No upsells, just honest options. The installation crew was professional and clean."</p>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                        <div>
                          <div className="font-bold text-foreground">Sarah Jenkins</div>
                          <div className="text-xs text-muted-foreground">Verified Customer</div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div>
            <div className="text-white font-heading font-bold text-2xl mb-6">
              {quizCompleted ? "ComfortAir" : "HVAC Quote Tool"}
            </div>
            <p className="text-sm leading-relaxed">
              Providing transparent, high-quality HVAC solutions for modern homeowners. We believe in honest pricing and expert craftsmanship.
            </p>
          </div>
          
          {/* Only show detailed footer links if quiz is completed, otherwise keep it minimal */}
          {quizCompleted ? (
            <>
              <div>
                <h4 className="text-white font-bold mb-6">Services</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">AC Installation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Furnace Repair</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Maintenance Plans</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Air Quality</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Company</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Reviews</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Contact</h4>
                <p className="text-sm mb-2">1234 Cooling Way, Suite 100</p>
                <p className="text-sm mb-4">Metropolis, NY 10012</p>
                <p className="text-white font-bold text-lg">(800) 555-0199</p>
              </div>
            </>
          ) : (
            <div className="col-span-3 flex items-center justify-center md:justify-end">
              <p className="text-sm">© 2025 HVAC Quote Tool. All rights reserved.</p>
            </div>
          )}
        </div>
      </footer>

      <LeadForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        selectedTier={selectedTier} 
      />
    </div>
  );
}
