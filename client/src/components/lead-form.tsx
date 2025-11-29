import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Service address is required"),
  notes: z.string().optional(),
});

interface LeadFormProps {
  selectedTier?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadForm({ selectedTier, isOpen, onClose }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock submission
    console.log("Form submitted:", { ...values, tier: selectedTier });
    setSubmitted(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 rounded-xl">
        {submitted ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground mb-2">Quote Request Received!</h3>
            <p className="text-muted-foreground mb-8">
              We've received your details and preference for the <span className="font-semibold text-primary">{selectedTier}</span> package. One of our certified technicians will contact you shortly to confirm details.
            </p>
            <Button onClick={onClose} className="w-full bg-primary text-white">Close</Button>
          </div>
        ) : (
          <>
            <div className="bg-primary p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading">Schedule Your Installation</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Lock in your price estimate for the <span className="font-bold text-white capitalize">{selectedTier?.replace(/-/g, ' ')}</span> package.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="bg-secondary/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} className="bg-secondary/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} className="bg-secondary/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Maple St, Anytown, USA" {...field} className="bg-secondary/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Gate code, dog in yard, specific time preference..." 
                            className="resize-none bg-secondary/30 min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-white mt-2">
                    Request Appointment
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By submitting, you agree to receive calls or texts about your estimate. Your data is secure and never sold.
                  </p>
                </form>
              </Form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
