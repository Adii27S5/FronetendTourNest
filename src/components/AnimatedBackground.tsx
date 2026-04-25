import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const AnimatedBackground = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  
  // Colors adjust based on theme. Hybrid mode will use the 'hybrid' class overrides from index.css.
  const gradient1 = currentTheme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : currentTheme === 'hybrid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.2)';
  const gradient2 = currentTheme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : currentTheme === 'hybrid' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(52, 211, 153, 0.2)';
  const gradient3 = currentTheme === 'dark' ? 'rgba(167, 139, 250, 0.15)' : currentTheme === 'hybrid' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(167, 139, 250, 0.2)';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background transition-colors duration-700">
      <motion.div
        animate={{
          x: ["0%", "50%", "0%", "-50%", "0%"],
          y: ["0%", "-50%", "50%", "0%", "0%"],
          scale: [1, 1.2, 1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[50%] -left-[50%] w-[100vw] h-[100vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"
        style={{ backgroundColor: gradient1 }}
      />
      <motion.div
        animate={{
          x: ["-50%", "0%", "50%", "0%", "-50%"],
          y: ["50%", "0%", "-50%", "0%", "50%"],
          scale: [1, 0.8, 1, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-[50%] -right-[50%] w-[100vw] h-[100vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"
        style={{ backgroundColor: gradient2 }}
      />
      <motion.div
        animate={{
          x: ["0%", "-30%", "30%", "0%"],
          y: ["-30%", "30%", "-30%", "-30%"],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[150px] opacity-60"
        style={{ backgroundColor: gradient3 }}
      />
      
      {/* Subtle overlay texture for depth */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
    </div>
  );
};

export default AnimatedBackground;
