import React, { useState } from 'react';
import { Rocket, ChevronRight } from 'lucide-react';

const AuthScreen = ({ supabase, isMock }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const action = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error } = await action;
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const redirectBase = `${window.location.origin}${import.meta.env.BASE_URL || '/'}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectBase,
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
        
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none text-white text-center"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none text-white text-center"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black py-3 px-6 rounded-lg font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-neutral-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-neutral-700 transition disabled:opacity-50"
          >
            Continue with Google
          </button>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          {mode === 'signin' ? (
            <button type="button" className="hover:text-white" onClick={() => setMode('signup')}>
              Need an account? Create one
            </button>
          ) : (
            <button type="button" className="hover:text-white" onClick={() => setMode('signin')}>
              Already have an account? Sign in
            </button>
          )}
        </div>

        <p className="text-xs text-neutral-600 mt-6">
          {isMock ? "Demo Mode: Any credentials work" : "Powered by Supabase (PostgreSQL)"}
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
