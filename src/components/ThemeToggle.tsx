import { useAppContext } from '@/contexts/AppContext';
import { Moon, Sun, Sparkles, Aperture } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ThemeToggle = () => {
  const { theme, setTheme } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    { id: 'light', icon: Sun, color: 'text-amber-500' },
    { id: 'dark', icon: Moon, color: 'text-blue-400' },
    { id: 'hybrid', icon: Sparkles, color: 'text-fuchsia-400' }
  ] as const;

  const activeMode = modes.find(m => m.id === theme) || modes[0];

  return (
    <div 
      className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-soft h-12"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="expanded"
            initial={{ width: 48, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 48, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 overflow-hidden px-1"
          >
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTheme(mode.id)}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === mode.id ? '' : 'hover:bg-white/10'}`}
              >
                {theme === mode.id && (
                  <motion.div
                    layoutId="active-shutter"
                    className="absolute inset-0 bg-white/20 shadow-glow rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <mode.icon className={`w-5 h-5 relative z-10 transition-transform ${mode.color} ${theme === mode.id ? 'scale-110' : 'opacity-50 scale-90'}`} />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Aperture className="absolute inset-0 w-full h-full text-foreground/20 p-1" />
            <activeMode.icon className={`w-5 h-5 relative z-10 ${activeMode.color}`} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
