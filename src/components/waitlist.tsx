"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Loader2, X } from "lucide-react";
import { waitlistService } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WaitlistModalProps {
  children: React.ReactNode;
}

export default function WaitlistModal({ children }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save email to Supabase database
      const result = await waitlistService.addEmail(email, navigator.userAgent);
      
      if (!result.success) {
        toast({
          title: result.error === 'Email already registered' ? "Already registered" : "Error",
          description: result.error === 'Email already registered' 
            ? "This email is already on the waitlist." 
            : result.error || "Please try again later.",
          variant: result.error === 'Email already registered' ? "default" : "destructive",
        });
        
        if (result.error === 'Email already registered') {
          // Still show success for already registered emails
          setIsSuccess(true);
          setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => {
              setIsSuccess(false);
              setEmail("");
            }, 300);
          }, 2000);
        }
        return;
      }

      // Success! Email saved to Supabase
      setIsSuccess(true);
      console.log('✅ Email successfully saved to Supabase:', email);
      
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "We'll notify you when OneKey launches.",
      });

      // Auto-close modal after success
      setTimeout(() => {
        setIsOpen(false);
        // Reset states when modal closes
        setTimeout(() => {
          setIsSuccess(false);
          setEmail("");
        }, 300);
      }, 2000);
      
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Connection error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SuccessContent = () => (
    <motion.div
      className="text-center space-y-4 py-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-semibold text-foreground">You're on the list!</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Thanks for joining the OneKey waitlist. We'll notify you as soon as we launch.
      </p>
    </motion.div>
  );

  const FormContent = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-2">
        <Mail className="w-12 h-12 text-primary mx-auto" />
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to experience secure identity verification with zero PII storage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            disabled={isLoading}
            autoFocus
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        We respect your privacy. No spam, unsubscribe at any time.
      </p>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the OneKey Waitlist</DialogTitle>
          <DialogDescription>
            Get early access to the future of identity verification.
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {isSuccess ? <SuccessContent /> : <FormContent />}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
} 