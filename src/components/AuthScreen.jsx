import React, { useState } from 'react';
import { Rocket, ChevronRight } from 'lucide-react';
import { supabaseUrl } from '../config';

export const AuthScreen = ({ supabase, isMock }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Debugging: Log the exact URLs needed for configuration
    console.log("--- Google OAuth Configuration Check ---");
    console.log("1. Add this to Google Cloud Console > Authorized redirect URIs:");
    console.log(`${supabaseUrl}/auth/v1/callback`);
    console.log("----------------------------------------");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 p-4 relative overflow-hidden">
      {isMock && (
        <div className="absolute top-0 w-full bg-yellow-600 text-black text-center py-1 text-xs font-bold uppercase tracking-widest z-50">
          Demo Mode (In-Memory)
        </div>
      )}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
        <div className="w-16 h-16 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-600/20">
          <Rocket className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">VentureTracker</h1>
        <p className="text-neutral-400 mb-8">Launch your semester startup project.</p>
        
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none text-white text-center"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black py-3 px-6 rounded-lg font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending Link...' : 'Send Login Link'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>
        
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900 text-neutral-500">Or continue with</span>
            </div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-black py-3 px-6 rounded-lg font-bold hover:bg-neutral-200 transition flex items-center justify-center gap-2 disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
        </button>

        <p className="text-xs text-neutral-600 mt-6">
          {isMock ? "Demo Mode: No Email Required" : "Powered by Supabase (PostgreSQL)"}
        </p>
      </div>
    </div>
  );
};