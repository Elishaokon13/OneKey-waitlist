"use client";

import  { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Loader2, Sparkles, Shield, Zap } from "lucide-react";
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
  const [userAgent, setUserAgent] = useState<string>("Unknown");
  const { toast } = useToast();

  // Safely get user agent only on client side to prevent hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator?.userAgent) {
      setUserAgent(navigator.userAgent);
    }
  }, []);

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
      // Save email to Supabase database with safely obtained user agent
      const result = await waitlistService.addEmail(email, userAgent);
      
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
      className="text-center space-y-6 py-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success Icon with Gradient Ring */}
      <div className="relative mx-auto w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold bg-gradient-to-b from-neutral-700 to-neutral-900 bg-clip-text text-transparent dark:from-neutral-50 dark:to-neutral-300 font-poppins">
          You're on the list!
        </h3>
        <p className="text-black/60 dark:text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
          Thanks for joining the OneKey waitlist. We'll notify you as soon as we launch our revolutionary identity verification platform.
        </p>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 gap-3 pt-4">
        <motion.div 
          className="flex items-center gap-3 text-sm text-black/70 dark:text-gray-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Shield className="w-4 h-4 text-primary" />
          <span>Zero PII storage guaranteed</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-3 text-sm text-black/70 dark:text-gray-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Zap className="w-4 h-4 text-primary" />
          <span>Instant verification across platforms</span>
        </motion.div>
      </div>
    </motion.div>
  );

  const FormContent = () => (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section with Icon */}
      <div className="text-center space-y-4">
        {/* Animated Icon */}
        <div className="relative mx-auto w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-teal-500/20 to-primary/20"
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(56, 178, 172, 0.2), rgba(20, 184, 166, 0.2), rgba(56, 178, 172, 0.2))",
                "linear-gradient(45deg, rgba(20, 184, 166, 0.2), rgba(56, 178, 172, 0.2), rgba(20, 184, 166, 0.2))"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <div className="absolute inset-2 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-b from-neutral-700 to-neutral-900 bg-clip-text text-transparent dark:from-neutral-50 dark:to-neutral-300 font-poppins">
            Join the Future of Identity
          </h3>
          <p className="text-black/60 dark:text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            Be among the first to experience secure identity verification with zero PII storage and complete user control.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input with Gradient Border */}
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-teal-500/20 to-primary/20 p-[1px]">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-background border-0 rounded-lg px-4 text-base focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>
        
        {/* Submit Button with Enhanced Design */}
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Securing your spot...</span>
            </motion.div>
          ) : (
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ gap: "12px" }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Join Waitlist</span>
            </motion.div>
          )}
        </Button>
      </form>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <motion.div 
          className="flex items-center gap-2 text-sm text-black/70 dark:text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Shield className="w-4 h-4 text-primary" />
          <span>Zero PII storage</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 text-sm text-black/70 dark:text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Zap className="w-4 h-4 text-primary" />
          <span>Instant verification</span>
        </motion.div>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
        We respect your privacy. No spam, unsubscribe at any time.
      </p>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-0 bg-background/95 backdrop-blur-xl">
        {/* Custom Background with Gradient Border */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-background to-teal-500/10" />
        <div className="absolute inset-0 rounded-lg bg-background/60 backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative">
          <DialogHeader className="sr-only">
            <DialogTitle>Join the OneKey Waitlist</DialogTitle>
            <DialogDescription>
              Get early access to the future of identity verification.
            </DialogDescription>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {isSuccess ? <SuccessContent /> : <FormContent />}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
} 