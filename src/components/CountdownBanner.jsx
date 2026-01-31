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
    <div className="bg-neutral-900 text-white px-4 py-2 flex justify-between items-center text-sm shadow-md z-20 relative border-b border-yellow-600/30">
      <div className="flex items-center gap-2 font-medium text-yellow-500">
        <Calendar className="w-4 h-4" />
        <span className="text-white">{message || 'Class Announcements'}</span>
      </div>
      {timeLeft && (
        <div className="font-mono font-bold bg-neutral-800 px-3 py-1 rounded text-yellow-400 border border-yellow-600/30">
          {timeLeft}
        </div>
      )}
    </div>
  );
};

export default CountdownBanner;