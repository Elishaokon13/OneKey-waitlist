"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, just store in localStorage for demo
      const waitlistEmails = JSON.parse(localStorage.getItem('waitlistEmails') || '[]');
      if (!waitlistEmails.includes(email)) {
        waitlistEmails.push(email);
        localStorage.setItem('waitlistEmails', JSON.stringify(waitlistEmails));
      }

      setIsSuccess(true);
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll notify you when OneKey launches.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        id="waitlist"
        className="w-full max-w-md mx-auto p-6 bg-card rounded-lg border dark:border-neutral-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">You're on the list!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thanks for joining the OneKey waitlist. We'll notify you as soon as we launch.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="waitlist"
      className="w-full max-w-md mx-auto p-6 bg-card rounded-lg border dark:border-neutral-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-4 mb-6">
        <Mail className="w-8 h-8 text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">Join the Waitlist</h2>
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

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        We respect your privacy. No spam, unsubscribe at any time.
      </p>
    </motion.div>
  );
} 