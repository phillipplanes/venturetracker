import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const CountdownBanner = ({ targetDate, message }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft('PITCH DAY IS HERE!');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setTimeLeft(`${days}d ${hours}h until Pitch Day`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000 * 60); 
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate && !message) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-600/15 via-neutral-900 to-yellow-600/15 text-white px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-sm shadow-lg z-20 relative border-b border-yellow-600/40">
      <div className="flex items-center gap-2 font-semibold text-yellow-400">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-600/40">
          <Calendar className="w-4 h-4" />
        </span>
        <span className="text-white tracking-wide">{message || 'Class Announcements'}</span>
      </div>
      {timeLeft && (
        <div className="font-mono font-bold bg-neutral-950/70 px-4 py-2 rounded-full text-yellow-300 border border-yellow-600/40 shadow-[0_0_18px_rgba(234,179,8,0.25)]">
          {timeLeft}
        </div>
      )}
    </div>
  );
};

export default CountdownBanner;
