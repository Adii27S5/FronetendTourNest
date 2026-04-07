import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    onVerify(value === captchaText);
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">
        Verify you are human
      </Label>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-14 bg-muted/30 rounded-2xl flex items-center justify-center border-2 border-border/50 relative overflow-hidden select-none">
          <div 
            className="text-2xl font-black tracking-[0.5em] italic text-primary/80"
            style={{ 
              textDecoration: 'line-through',
              fontFamily: 'serif',
              filter: 'blur(0.5px)'
            }}
          >
            {captchaText}
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent pointer-events-none" />
        </div>
        <button 
          type="button"
          onClick={generateCaptcha}
          className="p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors group"
          title="Refresh Captcha"
        >
          <RefreshCw className="w-6 h-6 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
      <Input
        type="text"
        placeholder="Enter the code above"
        value={userInput}
        onChange={handleChange}
        className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary transition-all font-bold text-center tracking-widest"
        required
      />
    </div>
  );
};

export default Captcha;
