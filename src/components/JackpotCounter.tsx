import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface JackpotCounterProps {
  value: number;
}

const JackpotCounter = ({ value }: JackpotCounterProps) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay((prev) => prev + Math.floor(Math.random() * 500 + 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatted = new Intl.NumberFormat("fr-FR").format(display);

  return (
    <motion.div
      className="text-center"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
        🎰 Jackpot Communautaire
      </p>
      <p className="font-display text-4xl font-black text-secondary text-glow-gold md:text-5xl">
        {formatted} Ar
      </p>
    </motion.div>
  );
};

export default JackpotCounter;
