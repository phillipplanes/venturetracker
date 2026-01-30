import React from 'react';
import { Rocket } from 'lucide-react';

export const LoadingScreen = ({ message = "Loading VentureTracker..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-black text-yellow-500">
    <div className="text-center">
      <Rocket className="w-12 h-12 animate-bounce mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white">{message}</h2>
    </div>
  </div>
);