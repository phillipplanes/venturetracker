import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { 
  Rocket, Users, CheckCircle2, Circle, Target, MessageSquare, 
  Plus, Layout, ChevronRight, Award, Settings, Calendar, Shield, Trash2, LogOut, Camera, Upload, Link as LinkIcon, X, Clock, AlertCircle, Check, FileText, DollarSign, TrendingUp, TrendingDown, PieChart, Edit2, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
// REMOVED: import { createClient } from '@supabase/supabase-js'; (Not supported in this environment without build step)

// --- Configuration ---

// REPLACE THESE WITH YOUR SUPABASE PROJECT DETAILS
const supabaseUrl = 'https://hhtotufostcudindmofs.supabase.co';
const supabaseKey = 'sb_publishable_NoBszCAfvlvzwJEecv6ztw_59hx4CI_';
const ROOT_ADMIN_EMAIL = 'planesp@wfu.edu';
const STORAGE_BUCKET = 'venture-assets'; 

// --- Constants ---

const PHASES = [
  {
    id: 'ideation',
    title: 'Ideation & Problem',
    tasks: [
      { id: 'p1_1', label: 'Define the core problem statement' },
      { id: 'p1_2', label: 'Identify target customer personas' },
      { id: 'p1_3', label: 'Draft initial value proposition' },
      { id: 'p1_4', label: 'Competitor analysis matrix' }
    ]
  },
  {
    id: 'discovery',
    title: 'Customer Discovery',
    tasks: [
      { id: 'p2_1', label: 'Conduct 10 customer interviews' },
      { id: 'p2_2', label: 'Synthesize interview insights' },
      { id: 'p2_3', label: 'Validate problem assumptions' },
      { id: 'p2_4', label: 'Refine solution hypothesis' }
    ]
  },
  {
    id: 'mvp',
    title: 'MVP & Business Model',
    tasks: [
      { id: 'p3_1', label: 'Create Lean Canvas' },
      { id: 'p3_2', label: 'Build low-fidelity prototype' },
      { id: 'p3_3', label: 'Test prototype with 5 users' },
      { id: 'p3_4', label: 'Define revenue model' }
    ]
  },
  {
    id: 'pitch',
    title: 'The Final Pitch',
    tasks: [
      { id: 'p4_1', label: 'Draft pitch deck outline' },
      { id: 'p4_2', label: 'Design visual slides' },
      { id: 'p4_3', label: 'Practice pitch delivery' },
      { id: 'p4_4', label: 'Final presentation' }
    ]
  }
];

// --- Mock Data & Client (Fallbacks) ---

const MOCK_USER = { id: 'mock-user-1', email: 'student@university.edu' };
const MOCK_TEAMS = [
  { 
    id: 'team-1', 
    name: 'EcoBox', 
    logo_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=150&q=80',
    description: 'We help e-commerce brands reduce plastic waste by providing reusable, durable packaging that customers return for rewards. Sustainable shipping made simple.', 
    members: ['mock-user-1', 'mock-user-2', 'mock-user-3'], 
    submissions: {
      'p1_1': { status: 'approved', summary: 'Defined problem as excessive single-use plastic.', submitted_at: new Date().toISOString() },
      'p1_2': { status: 'approved', summary: 'Targeting D2C cosmetic brands.', submitted_at: new Date().toISOString() },
      'p1_3': { status: 'approved', summary: 'Value prop: Save money on packaging while saving the planet.', submitted_at: new Date().toISOString() },
      'p2_1': { status: 'pending', summary: 'Interviewed 8/10 customers.', submitted_at: new Date().toISOString() }
    },
    task_evidence: { 'p1_1': 'https://via.placeholder.com/300?text=Problem+Statement+Proof' },
    created_at: new Date().toISOString()
  },
  { 
    id: 'team-2', 
    name: 'CampusEats', 
    description: 'A peer-to-peer food delivery network exclusive to university campuses, allowing students to earn money delivering dining hall food to dorms.', 
    members: ['other-user'], 
    submissions: {
        'p1_1': { status: 'approved', summary: 'Interviewed 20 students.', submitted_at: new Date().toISOString() }
    },
    task_evidence: {},
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];
const MOCK_UPDATES = [
  {
    id: 'up-1',
    team_id: 'team-1',
    content: 'We finished our first 5 interviews! People really hate styrofoam. We took some photos of the current packaging waste at the dorms.',
    author_email: 'student@university.edu',
    author_id: 'mock-user-1',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'up-2',
    team_id: 'team-2',
    content: 'Pivoting to focusing on late-night snacks only. The dining hall lines are too long during lunch.',
    author_email: 'founder@campuseats.edu',
    author_id: 'other-user',
    created_at: new Date().toISOString()
  },
  {
    id: 'up-3',
    team_id: 'team-1',
    content: 'Prototype V1 is ready! It is made of recycled cardboard for now.',
    author_email: 'student@university.edu',
    author_id: 'mock-user-1',
    image_url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 10000000).toISOString()
  }
];
const MOCK_TRANSACTIONS = [
    { id: 't1', team_id: 'team-1', type: 'deposit', amount: 500.00, description: 'Class Seed Grant', date: new Date(Date.now() - 100000000).toISOString() },
    { id: 't2', team_id: 'team-1', type: 'expense', amount: 12.99, description: 'Domain Name (GoDaddy)', date: new Date(Date.now() - 50000000).toISOString() },
    { id: 't3', team_id: 'team-1', type: 'expense', amount: 45.00, description: 'Poster Printing', date: new Date().toISOString() }
];
const MOCK_SETTINGS = { banner_message: 'Welcome to Demo Mode! Configure Supabase to go live.', pitch_date: new Date(Date.now() + 86400000 * 30).toISOString() };

class MockSupabaseClient {
  constructor() {
    this.teams = [...MOCK_TEAMS];
    this.updates = [...MOCK_UPDATES];
    this.transactions = [...MOCK_TRANSACTIONS];
    this.settings = { ...MOCK_SETTINGS };
    this.subs = {};
  }

  auth = {
    getSession: async () => ({ data: { session: { user: MOCK_USER } } }),
    signInWithOtp: async ({ email }) => {
       alert(`[DEMO] Magic link sent to ${email} (Check console to see pseudo-login)`);
       return { error: null };
    },
    signOut: async () => { window.location.reload(); },
    onAuthStateChange: (cb) => {
      // Small delay to simulate async auth check
      setTimeout(() => cb('SIGNED_IN', { user: MOCK_USER }), 500);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }

  storage = {
    from: (bucket) => ({
      upload: async (path, file) => {
        console.log(`[Mock Storage] Uploading ${file.name} to ${bucket}/${path}`);
        await new Promise(r => setTimeout(r, 1000)); // Simulate delay
        return { data: { path }, error: null };
      },
      getPublicUrl: (path, options) => {
        let url = `https://mock-storage.com/${bucket}/${path}`;
        if (options?.transform) {
            url += `?w=${options.transform.width}&h=${options.transform.height}`;
        }
        return { data: { publicUrl: url } };
      }
    })
  }

  from(table) {
    const self = this;
    return {
      select: (cols) => {
        return {
          single: async () => ({ data: self.settings, error: null }),
          order: async (col, { ascending } = {}) => {
             let data = [];
             if (table === 'teams') data = self.teams;
             if (table === 'updates') data = self.updates;
             if (table === 'transactions') data = self.transactions;
             // Mock sort (simple)
             return { data, error: null };
          },
          eq: (col, val) => {
             return {
                 order: async () => {
                    let data = [];
                    if (table === 'updates') data = self.updates;
                    if (table === 'transactions') data = self.transactions;
                    
                    return { data: data.filter(u => u[col] === val), error: null };
                 }
             }
          }
        }
      },
      insert: async (rows) => {
        const row = { ...rows[0], id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
        if (table === 'teams') self.teams.unshift(row);
        if (table === 'updates') self.updates.unshift(row);
        if (table === 'transactions') self.transactions.unshift(row);
        return { data: [row], error: null };
      },
      update: (updates) => {
        return {
          eq: async (col, val) => {
            if (table === 'teams') {
               const idx = self.teams.findIndex(t => t[col] === val);
               if (idx > -1) self.teams[idx] = { ...self.teams[idx], ...updates };
            }
            if (table === 'transactions') {
               const idx = self.transactions.findIndex(t => t[col] === val);
               if (idx > -1) self.transactions[idx] = { ...self.transactions[idx], ...updates };
            }
            return { error: null };
          }
        }
      },
      delete: () => {
        return {
            eq: async (col, val) => {
                if (table === 'transactions') {
                    const idx = self.transactions.findIndex(t => t[col] === val);
                    if (idx > -1) self.transactions.splice(idx, 1);
                }
                return { error: null };
            }
        }
      }
    };
  }

  channel(name) {
    const channelStub = {
      on: (event, filter, callback) => channelStub,
      subscribe: (callback) => {
        console.log(`[Mock] Subscribed to channel ${name}`);
        return { unsubscribe: () => {} };
      }
    };
    return channelStub;
  }
  removeChannel() {}
}

// --- Components ---

const LoadingScreen = ({ message = "Loading VentureTracker..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-black text-yellow-500">
    <div className="text-center">
      <Rocket className="w-12 h-12 animate-bounce mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white">{message}</h2>
    </div>
  </div>
);

const AuthScreen = ({ supabase, isMock }) => {
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

const TeamCard = ({ team, onClick }) => {
  // Logic updated to count Approved tasks only
  const submissions = team.submissions || {};
  const totalTasks = PHASES.reduce((acc, p) => acc + p.tasks.length, 0);
  const approvedCount = Object.values(submissions).filter(s => s.status === 'approved').length;
  const progress = Math.round((approvedCount / totalTasks) * 100);

  return (
    <div 
      onClick={onClick}
      className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 shadow-sm hover:border-yellow-600/50 transition cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          {team.logo_url && <img src={team.logo_url} alt={team.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-neutral-800" />}
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition truncate">
              {team.name}
            </h3>
            <p className="text-sm text-neutral-400 line-clamp-1">{team.description}</p>
          </div>
        </div>
        <span className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-1 rounded-full font-medium border border-yellow-600/20">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-yellow-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-neutral-500">
        <Users className="w-3 h-3" />
        <span>{team.members ? team.members.length : 0} members</span>
      </div>
    </div>
  );
};

const CreateOrJoinTeam = ({ user, teams, onJoin, onCreate }) => {
  const [mode, setMode] = useState('selection');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  if (mode === 'create') {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800">
        <h2 className="text-2xl font-bold mb-6 text-white">Start a New Venture</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Team Logo</label>
            <div className="flex items-center gap-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 bg-neutral-950 border border-neutral-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-500 overflow-hidden group"
                >
                    {logoFile ? (
                        <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="w-6 h-6 text-neutral-600 group-hover:text-yellow-500" />
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
                    }}
                />
                <span className="text-xs text-neutral-500">Click to upload (Optional)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Startup Name</label>
            <input 
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none text-white"
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">One-Liner Description</label>
            <input 
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none text-white"
              placeholder="What problem are you solving?"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setMode('selection')}
              className="px-6 py-2 text-neutral-400 hover:bg-neutral-800 rounded-lg"
            >
              Cancel
            </button>
            <button 
              disabled={!newTeamName.trim()}
              onClick={() => onCreate(newTeamName, newTeamDesc, logoFile)}
              className="px-6 py-2 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50"
            >
              Launch Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome, Entrepreneur</h2>
        <p className="text-neutral-400">Join an existing team or found a new one to begin.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div 
          onClick={() => setMode('create')}
          className="bg-neutral-900 p-8 rounded-xl border-2 border-dashed border-neutral-700 hover:border-yellow-500 hover:bg-neutral-800 transition cursor-pointer flex flex-col items-center justify-center text-center group"
        >
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-neutral-700 transition border border-neutral-700">
            <Plus className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Create a New Team</h3>
          <p className="text-sm text-neutral-400">I have an idea and need co-founders.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Available Teams</h3>
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-neutral-700">
            {teams.length === 0 ? <p className="text-neutral-600 italic">No active teams yet.</p> : teams.map(team => (
              <div key={team.id} className="bg-neutral-900 p-4 rounded-lg shadow-sm border border-neutral-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-neutral-200">{team.name}</h4>
                  <p className="text-sm text-neutral-500">{team.description}</p>
                </div>
                <button onClick={() => onJoin(team.id, team.members)} className="text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-md font-medium border border-neutral-700">Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateFeed = ({ updates, onPostUpdate, uploading, readOnly = false }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = () => {
    if (!newUpdate.trim()) return;
    onPostUpdate(newUpdate, selectedFile);
    setNewUpdate('');
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
      <div className="bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-300 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-yellow-500" />
          Post Weekly Update
        </h3>
        <textarea
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          placeholder="What did you achieve this week? Any blockers?"
          className="w-full p-3 bg-neutral-950 rounded-lg border border-neutral-800 focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 outline-none text-white text-sm mb-3 resize-none h-24 placeholder-neutral-600"
        />
        
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 text-xs bg-neutral-800 p-2 rounded text-neutral-300">
             <span className="truncate max-w-[200px]">{selectedFile.name}</span>
             <button onClick={() => setSelectedFile(null)} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex justify-end gap-2 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          <button 
            className="text-neutral-400 hover:text-yellow-500 p-2 rounded-full hover:bg-neutral-800 transition" 
            title="Attach Photo"
            onClick={() => fileInputRef.current?.click()}
          >
             <Camera className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!newUpdate.trim() || uploading} 
            className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50 transition flex items-center gap-2"
          >
            {uploading ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      </div>
      )}

      <div className="space-y-4">
        {updates.length === 0 ? <div className="text-center py-8 text-neutral-600 text-sm">No updates available.</div> : updates.map((update) => (
          <div key={update.id} className="bg-neutral-900 p-5 rounded-xl shadow-sm border border-neutral-800">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-700 flex items-center justify-center text-black text-xs font-bold shadow-lg">
                  {update.author_email ? update.author_email[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Team Member</p>
                  <p className="text-[10px] text-neutral-500">{new Date(update.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <p className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed mb-3">{update.content}</p>
            {update.image_url && (
              <div className="mt-2 rounded-lg overflow-hidden border border-neutral-800">
                <img src={update.image_url} alt="Update attachment" className="w-full h-auto object-cover max-h-64" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewPanel = ({ taskId, currentStatus, submission, onReview }) => {
    const [note, setNote] = useState('');
    
    if (currentStatus === 'approved') return null;

    return (
        <div className="mt-2 pl-8 pb-2">
            <div className="bg-neutral-950 border border-neutral-800 rounded p-3 text-sm">
                <p className="text-neutral-400 text-xs uppercase font-bold mb-2">Student Submission</p>
                <div className="bg-neutral-900 p-2 rounded text-neutral-300 text-sm mb-3 border border-neutral-800 italic">
                    "{submission.summary || "No summary provided."}"
                </div>

                <p className="text-neutral-400 text-xs uppercase font-bold mb-2">Admin Feedback</p>
                <input 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white mb-2 text-xs"
                    placeholder="Feedback for the team (optional)..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
                <div className="flex gap-2">
                    <button 
                        onClick={() => onReview(taskId, 'approved', note)}
                        className="bg-green-800 hover:bg-green-700 text-green-100 text-xs px-3 py-1 rounded flex items-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Approve
                    </button>
                    <button 
                        onClick={() => onReview(taskId, 'rejected', note)}
                        className="bg-red-900/50 hover:bg-red-900 text-red-200 text-xs px-3 py-1 rounded flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Reject
                    </button>
                </div>
            </div>
        </div>
    )
}

const SubmissionModal = ({ task, existingSummary, onSubmit, onCancel }) => {
    const [summary, setSummary] = useState(existingSummary || '');

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Submit Milestone</h3>
                <p className="text-sm text-neutral-400 mb-4">{task.label}</p>
                
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-2">
                    What did you do? (Summary)
                </label>
                <textarea 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm h-32 focus:border-yellow-500 outline-none"
                    placeholder="Describe your work, findings, or results..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                />
                
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSubmit(summary)}
                        disabled={!summary.trim()}
                        className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                        Submit for Approval
                    </button>
                </div>
            </div>
        </div>
    );
};

const MilestoneTracker = ({ team, onSubmitTask, onReviewTask, onUploadProof, uploading, isAdmin, readOnly = false }) => {
    const submissions = team.submissions || {}; 
    const taskEvidence = team.task_evidence || {}; 
    const fileInputRef = useRef(null);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [expandedReview, setExpandedReview] = useState(null);
    const [submissionTask, setSubmissionTask] = useState(null); 

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0] && activeTaskId) {
        onUploadProof(activeTaskId, e.target.files[0]);
        setActiveTaskId(null); // Reset
      }
    };

    const triggerUpload = (taskId) => {
      setActiveTaskId(taskId);
      setTimeout(() => fileInputRef.current?.click(), 0);
    };

    const approvedCount = Object.values(submissions).filter(s => s.status === 'approved').length;
    
    return (
      <>
        {!readOnly && submissionTask && (
            <SubmissionModal 
                task={submissionTask}
                existingSummary={submissions[submissionTask.id]?.summary}
                onSubmit={(summary) => {
                    onSubmitTask(submissionTask.id, summary);
                    setSubmissionTask(null);
                }}
                onCancel={() => setSubmissionTask(null)}
            />
        )}

        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden">
            <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            />
            <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-500" />
                Venture Roadmap
            </h3>
            <span className="text-xs font-mono bg-neutral-800 border border-neutral-700 text-neutral-400 px-2 py-1 rounded">
                {approvedCount} / {PHASES.reduce((a,b)=>a+b.tasks.length,0)} Approved
            </span>
            </div>
            
            <div className="p-4 space-y-6">
            {PHASES.map((phase, idx) => {
                const phaseTasks = phase.tasks;
                const approvedInPhase = phaseTasks.filter(t => submissions[t.id]?.status === 'approved').length;
                const isPhaseComplete = approvedInPhase === phaseTasks.length;
    
                return (
                <div key={phase.id} className="relative pl-6 border-l-2 border-neutral-800 last:border-0">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isPhaseComplete ? 'bg-yellow-500 border-yellow-500' : 'bg-neutral-900 border-neutral-700'}`}>
                    {isPhaseComplete && <CheckCircle2 className="w-3 h-3 text-black absolute top-0 left-0" />}
                    </div>
                    
                    <h4 className="text-sm font-bold text-neutral-200 mb-3 flex items-center justify-between">
                    {phase.title}
                    <span className="text-xs font-normal text-neutral-500">{approvedInPhase}/{phaseTasks.length}</span>
                    </h4>
                    
                    <div className="space-y-2">
                    {phase.tasks.map(task => {
                        const submission = submissions[task.id] || {};
                        const status = submission.status || 'incomplete';
                        // In ReadOnly mode, we don't show specific evidence links as per user request to hide "all notes" etc
                        // But progress visual is ok
                        const hasProof = taskEvidence[task.id];

                        let statusIcon = <Circle className="w-3.5 h-3.5 text-neutral-600" />;
                        let statusClass = "hover:bg-neutral-800";
                        let statusText = "text-neutral-300";

                        if (status === 'approved') {
                            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
                            statusClass = "bg-green-950/20 border-green-900/30";
                            statusText = "text-green-400";
                        } else if (status === 'pending') {
                            statusIcon = <Clock className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />;
                            statusClass = "bg-yellow-950/20 border-yellow-900/30";
                            statusText = "text-yellow-500";
                        } else if (status === 'rejected') {
                            statusIcon = <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
                            statusText = "text-red-400";
                        }

                        if (readOnly) {
                            statusClass = "border-transparent bg-neutral-900/30"; // Static style for read-only
                        }

                        return (
                        <div key={task.id} className="flex flex-col">
                            <div className={`flex items-center justify-between gap-3 p-2 rounded-lg transition-colors border ${statusClass}`}>
                                <div className={`flex items-start gap-3 flex-1 ${!readOnly ? 'cursor-pointer' : ''}`} onClick={() => {
                                    if (readOnly) return;
                                    if (isAdmin) {
                                        setExpandedReview(expandedReview === task.id ? null : task.id);
                                    } else {
                                        if (status === 'incomplete' || status === 'rejected') {
                                            setSubmissionTask(task);
                                        }
                                    }
                                }}>
                                    <div className="relative flex items-center mt-0.5">
                                        {statusIcon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm ${status === 'approved' ? 'line-through opacity-70' : ''} ${statusText}`}>
                                            {task.label}
                                        </span>
                                        {status === 'pending' && <span className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider">Pending Approval</span>}
                                        {status === 'approved' && <span className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Approved</span>}
                                        
                                        {!readOnly && status === 'rejected' && submission.feedback && (
                                            <span className="text-xs text-red-400 mt-1">Feedback: "{submission.feedback}"</span>
                                        )}
                                        {!readOnly && submission.notes && <span className="text-xs text-neutral-500 mt-1 italic">"{submission.notes}"</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                {!readOnly && hasProof && (
                                    <a 
                                    href={hasProof} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 p-1" 
                                    title="View Proof"
                                    onClick={(e) => e.stopPropagation()}
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </a>
                                )}
                                {!readOnly && !isAdmin && status !== 'approved' && (
                                    <button 
                                        className={`${hasProof ? 'text-yellow-500' : 'text-neutral-500'} hover:text-yellow-500 p-1`}
                                        title={hasProof ? "Replace Proof" : "Upload Evidence"}
                                        disabled={uploading}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerUpload(task.id);
                                        }}
                                    >
                                        {activeTaskId === task.id && uploading ? <span className="animate-spin text-xs">↻</span> : <Upload className="w-4 h-4" />}
                                    </button>
                                )}
                                </div>
                            </div>
                            
                            {!readOnly && isAdmin && (status === 'pending' || expandedReview === task.id) && (
                                <ReviewPanel 
                                    taskId={task.id} 
                                    currentStatus={status} 
                                    submission={submission}
                                    onReview={onReviewTask} 
                                />
                            )}
                        </div>
                        );
                    })}
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </>
    );
  };

const ProfessorFeedback = ({ team, isAdmin, onPostFeedback, uploading }) => {
    const [note, setNote] = useState('');
    const feedbackList = team.feedback || [];

    // Sort feedback by date desc
    const sortedFeedback = [...feedbackList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const handleSubmit = () => {
        if (!note.trim()) return;
        onPostFeedback(note);
        setNote('');
    };

    if (!isAdmin && feedbackList.length === 0) return null;

    return (
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-sm">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-500" />
                Professor Feedback
            </h3>

            {isAdmin && (
                <div className="mb-6">
                    <textarea 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm h-24 focus:border-yellow-500 outline-none resize-none placeholder-neutral-600"
                        placeholder="Leave a note for the team..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                            onClick={handleSubmit}
                            disabled={!note.trim() || uploading}
                            className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                        >
                            {uploading ? 'Posting...' : 'Post Note'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {sortedFeedback.map((item, idx) => (
                    <div key={idx} className="bg-neutral-950/50 border border-neutral-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-yellow-500 text-xs font-bold uppercase">Admin Note</span>
                            <span className="text-neutral-500 text-[10px]">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-neutral-300 text-sm whitespace-pre-wrap">{item.content}</p>
                    </div>
                ))}
                {feedbackList.length === 0 && isAdmin && (
                    <p className="text-neutral-600 text-sm italic text-center">No feedback notes yet.</p>
                )}
            </div>
        </div>
    );
};

const TeamLogo = ({ url, name, className = "w-10 h-10 rounded-md", iconSize = "w-5 h-5" }) => {
    const [error, setError] = useState(false);
    if (!url || error) {
        return (
            <div className={`${className} bg-neutral-800 flex items-center justify-center border border-neutral-700 flex-shrink-0 shadow-sm`}>
                <Rocket className={`${iconSize} text-neutral-600`} />
            </div>
        );
    }
    return (
        <img src={url} alt={name} className={`${className} object-cover flex-shrink-0 bg-neutral-800`} onError={() => setError(true)} />
    );
};

const AdminDashboard = ({ teams = [], admins = [], settings, onUpdateSettings, onAddAdmin, onRemoveAdmin, onViewTeam, uploading }) => {
    const [tab, setTab] = useState('overview');
    const [bannerMsg, setBannerMsg] = useState(settings?.banner_message || '');
    const [pitchDate, setPitchDate] = useState(settings?.pitch_date || '');
    const [newAdminEmail, setNewAdminEmail] = useState('');

    useEffect(() => {
        if (settings) {
            setBannerMsg(settings.banner_message || '');
            setPitchDate(settings.pitch_date || '');
        }
    }, [settings]);

    const saveSettings = () => {
        onUpdateSettings({ ...settings, banner_message: bannerMsg, pitch_date: pitchDate });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Shield className="w-8 h-8 text-yellow-500" />
                Admin Dashboard
            </h1>

            <div className="flex gap-4 border-b border-neutral-800 mb-8">
                {['overview', 'teams', 'users', 'settings'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition ${tab === t ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-neutral-500 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                        <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">Total Teams</h3>
                        <p className="text-4xl font-bold text-white">{teams.length}</p>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                        <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">Total Students</h3>
                        <p className="text-4xl font-bold text-white">{teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}</p>
                    </div>
                </div>
            )}

            {tab === 'teams' && (
                <div className="space-y-4">
                    {teams.map(team => (
                        <div key={team.id} className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <TeamLogo url={team.logo_url} name={team.name} />
                                <div>
                                    <h4 className="font-bold text-white">{team.name}</h4>
                                    <p className="text-xs text-neutral-500">{team.members?.length || 0} members</p>
                                </div>
                            </div>
                            <button onClick={() => onViewTeam(team)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded border border-neutral-700 transition">
                                View Dashboard
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'users' && (
                <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 max-w-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Manage Admins</h3>
                    <div className="flex gap-4 mb-6">
                        <input type="email" placeholder="Enter email..." className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                        <button onClick={() => { onAddAdmin(newAdminEmail); setNewAdminEmail(''); }} disabled={!newAdminEmail || uploading} className="bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 disabled:opacity-50">Add</button>
                    </div>
                    <div className="space-y-2">
                        {admins.map(admin => (
                            <div key={admin.id} className="bg-neutral-950/50 p-4 flex justify-between items-center rounded border border-neutral-800">
                                <span className="text-white">{admin.email}</span>
                                <button onClick={() => onRemoveAdmin(admin.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {admins.length === 0 && <p className="text-neutral-600 italic">No additional admins.</p>}
                    </div>
                </div>
            )}

            {tab === 'settings' && (
                <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 max-w-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Global Settings</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Banner Message</label>
                            <input className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={bannerMsg} onChange={e => setBannerMsg(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Pitch Date</label>
                            <input type="datetime-local" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={pitchDate ? new Date(pitchDate).toISOString().slice(0, 16) : ''} onChange={e => setPitchDate(e.target.value)} />
                        </div>
                        <button onClick={saveSettings} disabled={uploading} className="bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">{uploading ? 'Saving...' : 'Save Settings'}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Financial Components (Hidden in Summary View) ---
const EditTransactionModal = ({ transaction, onSave, onDelete, onCancel }) => {
    const [amount, setAmount] = useState(transaction.amount);
    const [desc, setDesc] = useState(transaction.description);
    const [type, setType] = useState(transaction.type);

    const handleSubmit = () => {
        onSave({
            ...transaction,
            amount: parseFloat(amount),
            description: desc,
            type: type
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Edit Transaction</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Type</label>
                        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                            <button 
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-neutral-400 hover:text-white'}`}
                            >
                                Expense
                            </button>
                            <button 
                                type="button"
                                onClick={() => setType('deposit')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'deposit' ? 'bg-green-900/50 text-green-200' : 'text-neutral-400 hover:text-white'}`}
                            >
                                Deposit
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Amount ($)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                        <input 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-3 mt-6">
                    <button onClick={() => onDelete(transaction.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={!amount || !desc}
                            className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FinanceDashboard = ({ teamId, transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('expense'); 
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Calculate Totals
    const totalRaised = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const currentBalance = totalRaised - totalSpent;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !desc) return;
        onAddTransaction({
            type,
            amount: parseFloat(amount),
            description: desc
        });
        setAmount('');
        setDesc('');
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider mb-1">Current Balance</p>
                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-yellow-500" />
                        {currentBalance.toFixed(2)}
                    </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider mb-1">Total Raised</p>
                    <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {totalRaised.toFixed(2)}
                    </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider mb-1">Total Spent</p>
                    <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        {totalSpent.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Transaction Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-fit">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-yellow-500" />
                        Log Transaction
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Type</label>
                            <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                                <button 
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-neutral-400 hover:text-white'}`}
                                >
                                    Expense
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setType('deposit')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'deposit' ? 'bg-green-900/50 text-green-200' : 'text-neutral-400 hover:text-white'}`}
                                >
                                    Deposit
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Amount ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                            <input 
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                placeholder="e.g. Website Hosting"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!amount || !desc}
                            className="w-full bg-yellow-600 text-black font-bold py-2 rounded hover:bg-yellow-500 disabled:opacity-50 transition"
                        >
                            Add Transaction
                        </button>
                    </form>
                </div>

                {/* Ledger List */}
                <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-neutral-500" />
                            Ledger History
                        </h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-neutral-950 text-neutral-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {transactions.map(t => (
                                    <tr 
                                        key={t.id} 
                                        onClick={() => setEditingTransaction(t)}
                                        className="hover:bg-neutral-800/50 cursor-pointer group transition-colors"
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            {new Date(t.date || t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 w-full">{t.description}</td>
                                        <td className={`p-4 text-right font-mono font-medium ${t.type === 'deposit' ? 'text-green-500' : 'text-red-400'}`}>
                                            {t.type === 'deposit' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Edit2 className="w-3 h-3 text-neutral-600 group-hover:text-yellow-500" />
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-neutral-600 italic">
                                            No transactions recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingTransaction && (
                <EditTransactionModal 
                    transaction={editingTransaction}
                    onSave={(updatedTx) => {
                        onUpdateTransaction(updatedTx);
                        setEditingTransaction(null);
                    }}
                    onDelete={(id) => {
                        onDeleteTransaction(id);
                        setEditingTransaction(null);
                    }}
                    onCancel={() => setEditingTransaction(null)}
                />
            )}
        </div>
    );
};

// --- New Public Team Profile Component ---

const PublicTeamProfile = ({ team, updates, totalTasks }) => {
    // Calculate Score
    const submissions = team.submissions || {};
    const approvedCount = Object.values(submissions).filter(s => s.status === 'approved').length;
    const score = Math.round((approvedCount / totalTasks) * 100);

    // Extract images from updates for the gallery
    const galleryImages = updates
        .filter(u => u.image_url)
        .map(u => ({ url: u.image_url, date: u.created_at, caption: u.content }));

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header / Hero */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            {team.logo_url && (
                                <img src={team.logo_url} alt={team.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-700 shadow-lg bg-neutral-800" />
                            )}
                            <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">{team.name}</h1>
                            <span className="px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-700/50 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                                Class of 2026
                            </span>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Elevator Pitch</h3>
                            <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl">
                                {team.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">The Team</h3>
                            <div className="flex flex-wrap gap-2">
                                {(team.members || []).map((memberId, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-neutral-800/50 border border-neutral-800 rounded-full pl-1 pr-4 py-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {/* Mock Initials */}
                                            {`M${idx + 1}`}
                                        </div>
                                        <span className="text-sm text-neutral-300">Member {idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Score Card */}
                    <div className="flex flex-col items-center justify-center bg-neutral-950/50 border border-neutral-800 rounded-xl p-6 min-w-[200px]">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Circular Progress Mock */}
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-neutral-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-yellow-500" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-white">{score}</span>
                                <span className="text-[10px] text-neutral-500 uppercase">Score</span>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-neutral-400">Completeness</p>
                            <p className="text-xs text-neutral-600">{approvedCount} Milestones Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Gallery & Milestones */}
                <div className="md:col-span-2 space-y-8">
                    {/* Gallery */}
                    {galleryImages.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-yellow-500" />
                                Project Gallery
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {galleryImages.map((img, i) => (
                                    <div key={i} className="group relative aspect-video bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-yellow-600/50 transition">
                                        <img src={img.url} alt="Update" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <p className="text-xs text-white line-clamp-1">{img.caption}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Simplified Milestones */}
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Milestone Progress</h3>
                        <MilestoneTracker 
                            team={team} 
                            readOnly={true} 
                            isAdmin={false}
                        />
                    </div>
                </div>

                {/* Right: Updates Feed */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Latest Updates</h3>
                    <UpdateFeed updates={updates} readOnly={true} />
                </div>
            </div>
        </div>
    );
};

// --- Main Application Logic (VentureTracker) ---

const VentureTracker = ({ supabase, isMock }) => {
  const [session, setSession] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [view, setView] = useState('dashboard'); // 'dashboard', 'all-teams', 'finances', 'team-summary'
  const [viewingTeam, setViewingTeam] = useState(null); // The team being viewed in public directory
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Auth & Initial Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Fetch Data (Teams & Settings)
  useEffect(() => {
    if (!session) return;

    // Fetch Settings
    supabase.from('settings').select('*').single().then(({ data }) => setSettings(data));

    // Initial Fetch Teams
    fetchTeams();
    fetchAdmins();

    // Set up Realtime Subscription for Teams
    const teamsSub = supabase.channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        fetchTeams(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(teamsSub); };
  }, [session, supabase]);

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
    if (data) {
        setAllTeams(data);
        const mine = data.find(t => t.members && t.members.includes(session.user.id));
        setMyTeam(mine);
    }
  };

  const fetchAdmins = async () => {
      const { data } = await supabase.from('admins').select('*');
      if (data) {
          setAdminList(data);
          const isRoot = session?.user?.email === ROOT_ADMIN_EMAIL;
          const isAdminUser = isRoot || data.some(a => a.email === session?.user?.email);
          if (isAdminUser && !myTeam) setView('admin-dashboard');
          if (isAdminUser) setIsAdmin(true);
      }
  };

  // 3. Fetch Updates & Transactions based on current view/team context
  useEffect(() => {
    // Determine which team we are looking at
    const targetTeamId = view === 'team-summary' ? viewingTeam?.id : myTeam?.id;
    if (!targetTeamId) return;

    const fetchUpdates = async () => {
        const { data } = await supabase.from('updates')
            .select('*')
            .eq('team_id', targetTeamId)
            .order('created_at', { ascending: false });
        if (data) setUpdates(data);
    };

    const fetchTransactions = async () => {
        // Only fetch transactions if viewing OWN team dashboard
        if (view === 'team-summary') {
            setTransactions([]); // Clear for security in public view
            return;
        }
        
        const { data } = await supabase.from('transactions')
            .select('*')
            .eq('team_id', targetTeamId)
            .order('created_at', { ascending: false });
        if (data) setTransactions(data);
    };

    fetchUpdates();
    fetchTransactions();

    // Realtime Updates
    const updatesSub = supabase.channel('public:updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'updates', filter: `team_id=eq.${targetTeamId}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setUpdates(prev => [payload.new, ...prev]);
          }
      })
      .subscribe();

    return () => { supabase.removeChannel(updatesSub); };
  }, [myTeam, viewingTeam, view, supabase]);


  // --- Helper: Upload File ---
  const uploadFile = async (file, pathPrefix) => {
    if (!file) return null;
    const fileName = `${pathPrefix}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file);
    
    if (error) {
      console.error('Upload Error:', error);
      alert('Upload failed. Check console.');
      return null;
    }
    
    // Use Supabase Image Transformations to enforce size and type
    const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName, {
        transform: {
            width: 500,
            height: 500,
            resize: 'cover',
            format: 'webp',
            quality: 80
        }
    });
    return publicUrl;
  };

  // --- Actions ---

  const handleCreateTeam = async (name, description, logoFile) => {
    let logo_url = null;
    if (logoFile) {
        setUploading(true);
        logo_url = await uploadFile(logoFile, 'team-logos');
        setUploading(false);
    }
    const { data, error } = await supabase.from('teams').insert([{
        name,
        description,
        logo_url,
        members: [session.user.id],
        submissions: {}, 
        task_evidence: {}
    }]).select();

    if (!error && data) {
        setMyTeam(data[0]); // Optimistic update
        setView('dashboard');
    }
  };

  const handleJoinTeam = async (teamId, currentMembers) => {
    const newMembers = [...(currentMembers || []), session.user.id];
    const { error } = await supabase.from('teams').update({ members: newMembers }).eq('id', teamId);
    if (!error) fetchTeams();
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    if (!window.confirm("Are you sure you want to leave your team?")) return;

    const newMembers = (myTeam.members || []).filter(uid => uid !== session.user.id);
    const { error } = await supabase.from('teams').update({ members: newMembers }).eq('id', myTeam.id);
    if (!error) {
        setMyTeam(null);
        fetchTeams();
    }
  };

  const handleSubmitTask = async (taskId, summary) => {
    if (!myTeam) return;
    const newSubmission = { status: 'pending', summary: summary, submitted_at: new Date().toISOString() };
    const newSubmissions = { ...(myTeam.submissions || {}), [taskId]: newSubmission };
    setMyTeam(prev => ({ ...prev, submissions: newSubmissions }));
    await supabase.from('teams').update({ submissions: newSubmissions }).eq('id', myTeam.id);
  };

  const handleReviewTask = async (taskId, decision, feedback) => {
      if (!myTeam) return;
      const updatedSubmission = {
          ...(myTeam.submissions[taskId] || {}),
          status: decision, 
          feedback: feedback, 
          approved_at: decision === 'approved' ? new Date().toISOString() : null
      };
      const newSubmissions = { ...(myTeam.submissions || {}), [taskId]: updatedSubmission };
      setMyTeam(prev => ({ ...prev, submissions: newSubmissions }));
      await supabase.from('teams').update({ submissions: newSubmissions }).eq('id', myTeam.id);
  };

  const handleUploadProof = async (taskId, file) => {
      if (!myTeam || !file) return;
      setUploading(true);
      const publicUrl = await uploadFile(file, `team_${myTeam.id}/proof`);
      if (publicUrl) {
        const newEvidence = { ...(myTeam.task_evidence || {}), [taskId]: publicUrl };
        setMyTeam(prev => ({ ...prev, task_evidence: newEvidence }));
        await supabase.from('teams').update({ task_evidence: newEvidence }).eq('id', myTeam.id);
      }
      setUploading(false);
  };

  const handlePostUpdate = async (content, file) => {
    if (!myTeam) return;
    setUploading(true);
    let imageUrl = null;
    if (file) { imageUrl = await uploadFile(file, `team_${myTeam.id}/updates`); }
    await supabase.from('updates').insert([{
        team_id: myTeam.id,
        content,
        author_email: session.user.email,
        author_id: session.user.id,
        image_url: imageUrl
    }]);
    setUploading(false);
  };

  const handlePostFeedback = async (content) => {
      if (!myTeam) return;
      setUploading(true);
      const newNote = {
          id: Math.random().toString(),
          content,
          created_at: new Date().toISOString(),
          author_id: session.user.id
      };
      const currentFeedback = myTeam.feedback || [];
      const updatedFeedback = [newNote, ...currentFeedback];
      
      setMyTeam(prev => ({ ...prev, feedback: updatedFeedback }));
      
      const { error } = await supabase.from('teams').update({ feedback: updatedFeedback }).eq('id', myTeam.id);
      if (error) {
          console.error("Error posting feedback:", error);
          alert("Failed to save feedback. Ensure 'feedback' column exists in 'teams' table.");
      }
      setUploading(false);
  };

  const handleUpdateSettings = async (newSettings) => {
      setSettings(newSettings);
      setUploading(true);
      const query = supabase.from('settings');
      const { error } = newSettings.id ? await query.update(newSettings).eq('id', newSettings.id) : await query.insert([newSettings]);
      setUploading(false);
  };

  const handleAddAdmin = async (email) => {
      setUploading(true);
      const { error } = await supabase.from('admins').insert([{ email }]);
      if (!error) fetchAdmins();
      setUploading(false);
  };

  const handleRemoveAdmin = async (id) => {
      if(!window.confirm("Remove admin access?")) return;
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (!error) fetchAdmins();
  };

  const handleAdminViewTeam = (team) => {
      setMyTeam(team);
      setView('dashboard');
      setIsAdmin(true);
  };

  const handleResetToMyTeam = () => {
      const mine = allTeams.find(t => t.members && t.members.includes(session.user.id));
      setMyTeam(mine);
      setView('dashboard');
  };

  const handleAddTransaction = async (transaction) => {
      if (!myTeam) return;
      const newTx = { id: Math.random().toString(), team_id: myTeam.id, ...transaction, created_at: new Date().toISOString() };
      setTransactions([newTx, ...transactions]);
      await supabase.from('transactions').insert([{ team_id: myTeam.id, ...transaction, created_by: session.user.id }]);
  };

  const handleUpdateTransaction = async (updatedTx) => {
      if (!myTeam) return;
      setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
      await supabase.from('transactions').update({ amount: updatedTx.amount, description: updatedTx.description, type: updatedTx.type }).eq('id', updatedTx.id);
  };

  const handleDeleteTransaction = async (id) => {
      if (!myTeam) return;
      setTransactions(prev => prev.filter(t => t.id !== id));
      await supabase.from('transactions').delete().eq('id', id);
  };

  if (loading) return <LoadingScreen />;
  if (!session) return <AuthScreen supabase={supabase} isMock={isMock} />;

  const isRoot = session?.user?.email === ROOT_ADMIN_EMAIL;
  const isAuthorizedAdmin = isRoot || adminList.some(a => a.email === session?.user?.email);

  if (view === 'admin-dashboard' && isAuthorizedAdmin) {
      return (
          <div className="min-h-screen bg-black flex flex-col">
              <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                      <Rocket className="w-6 h-6 text-yellow-500" />
                      <span className="font-bold text-white">VentureTracker <span className="text-neutral-500 font-normal">| Admin</span></span>
                  </div>
                  <div className="flex items-center gap-4">
                      {myTeam && <button onClick={() => setView('dashboard')} className="text-sm text-neutral-400 hover:text-white">Student View</button>}
                      <button onClick={() => supabase.auth.signOut()} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">Sign Out <LogOut className="w-4 h-4"/></button>
                  </div>
              </header>
              <AdminDashboard 
                  teams={allTeams} admins={adminList} settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onAddAdmin={handleAddAdmin} onRemoveAdmin={handleRemoveAdmin}
                  onViewTeam={handleAdminViewTeam} uploading={uploading}
              />
          </div>
      );
  }

  if (!myTeam) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <CountdownBanner targetDate={settings?.pitch_date} message={settings?.banner_message} />
        <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-yellow-500" />
            <span className="font-bold text-white">VentureTracker</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
             Sign Out <LogOut className="w-4 h-4"/>
          </button>
        </header>
        <CreateOrJoinTeam user={session.user} teams={allTeams} onJoin={handleJoinTeam} onCreate={handleCreateTeam} />
      </div>
    );
  }

  // Header Logic
  const currentDisplayTeam = view === 'team-summary' ? viewingTeam : myTeam;
  const submissions = currentDisplayTeam?.submissions || {};
  const totalTasks = PHASES.reduce((acc, p) => acc + p.tasks.length, 0);
  const approvedCount = Object.values(submissions).filter(s => s.status === 'approved').length;
  const progressPercent = Math.round((approvedCount / totalTasks) * 100);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {isMock && (
          <div className="bg-yellow-600 text-black text-center py-1 text-xs font-bold uppercase tracking-widest z-50">
            Demo Mode (Data is not saved)
          </div>
      )}
      <CountdownBanner targetDate={settings?.pitch_date} message={settings?.banner_message} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-neutral-950 border-r border-neutral-800 flex-shrink-0 flex flex-col h-full">
            <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center gap-2 mb-1">
                <Rocket className="w-6 h-6 text-yellow-500" />
                <span className="font-bold text-white">VentureTracker</span>
            </div>
            <p className="text-xs text-neutral-500">Class of Spring 2026</p>
            </div>
            <div className="p-4 space-y-2">
            <button onClick={handleResetToMyTeam} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${view === 'dashboard' ? 'bg-yellow-900/20 text-yellow-500 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
                <Layout className="w-5 h-5" /> My Dashboard
            </button>
            <button onClick={() => setView('finances')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${view === 'finances' ? 'bg-yellow-900/20 text-yellow-500 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
                <DollarSign className="w-5 h-5" /> Finances
            </button>
            <button onClick={() => setView('all-teams')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${view === 'all-teams' ? 'bg-yellow-900/20 text-yellow-500 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
                <Users className="w-5 h-5" /> Class Directory
            </button>
            <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
                <LogOut className="w-5 h-5" /> Sign Out
            </button>
            
            <div className="mt-8 px-4">
                <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
                    <p className="text-[10px] text-neutral-500 uppercase font-bold mb-2">Admin Controls</p>
                    {isAuthorizedAdmin ? (
                        <>
                            <button onClick={() => setView('admin-dashboard')} className={`w-full py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition mb-2 ${view === 'admin-dashboard' ? 'bg-yellow-900/20 text-yellow-500' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}>
                                <Settings className="w-3 h-3" /> Admin Dashboard
                            </button>
                            <button onClick={() => setIsAdmin(!isAdmin)} className={`w-full py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition ${isAdmin ? 'bg-red-900/50 text-red-200' : 'bg-neutral-800 text-neutral-400'}`}>
                                <Shield className="w-3 h-3" />
                                {isAdmin ? 'Admin View Active' : 'Switch to Admin'}
                            </button>
                        </>
                    ) : (
                        <p className="text-xs text-neutral-600 italic text-center">Student Access Only</p>
                    )}
                </div>
            </div>
            </div>
            
            <div className="p-4 mt-auto border-t border-neutral-800">
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-yellow-600/30 rounded-lg p-4 text-white">
                    <p className="text-xs opacity-80 uppercase tracking-wider mb-1 text-yellow-500">My Team</p>
                    <h3 className="font-bold text-sm truncate">{myTeam.name}</h3>
                    <button onClick={handleLeaveTeam} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                        <LogOut className="w-3 h-3" /> Leave Team
                    </button>
                </div>
            </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-black">
            <header className="bg-neutral-950 border-b border-neutral-800 px-8 py-6 flex items-center gap-4">
                {view === 'team-summary' && (
                    <button 
                        onClick={() => setView('all-teams')}
                        className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {view === 'dashboard' && 'Team Dashboard'}
                        {view === 'finances' && 'Financial Ledger'}
                        {view === 'all-teams' && 'Class Directory'}
                        {view === 'team-summary' && (viewingTeam ? viewingTeam.name : 'Team Summary')}
                    </h1>
                    {view === 'team-summary' && (
                        <p className="text-neutral-500 text-sm">Public Profile</p>
                    )}
                </div>
            </header>
            
            <div className="p-8 max-w-6xl mx-auto">
            
            {/* Dashboard (My Team) */}
            {view === 'dashboard' && (
                <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-4">
                                {myTeam?.logo_url && <img src={myTeam.logo_url} alt={myTeam.name} className="w-16 h-16 rounded-lg object-cover bg-neutral-800" />}
                                <div>
                                    <h2 className="text-xl font-bold text-white">{myTeam?.name}</h2>
                                    <p className="text-neutral-400 mt-1">{myTeam?.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-yellow-500">{progressPercent}%</div>
                                <p className="text-xs text-neutral-500">Total Approved</p>
                            </div>
                        </div>
                    </div>
                    <MilestoneTracker 
                        team={myTeam} 
                        onSubmitTask={handleSubmitTask} 
                        onReviewTask={handleReviewTask}
                        onUploadProof={handleUploadProof} 
                        uploading={uploading}
                        isAdmin={isAdmin}
                    />
                </div>
                <div className="space-y-6">
                    <ProfessorFeedback 
                        team={myTeam}
                        isAdmin={isAdmin}
                        onPostFeedback={handlePostFeedback}
                        uploading={uploading}
                    />
                    <UpdateFeed 
                        updates={updates} 
                        onPostUpdate={handlePostUpdate} 
                        user={session.user} 
                        uploading={uploading}
                        readOnly={isAdmin}
                    />
                </div>
                </div>
            )}

            {/* Public Team Profile */}
            {view === 'team-summary' && viewingTeam && (
                <PublicTeamProfile 
                    team={viewingTeam} 
                    updates={updates} 
                    totalTasks={PHASES.reduce((a,b)=>a+b.tasks.length,0)} 
                />
            )}

            {view === 'finances' && (
                <FinanceDashboard 
                    teamId={myTeam.id}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    onUpdateTransaction={handleUpdateTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                />
            )}

            {view === 'all-teams' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTeams.map(team => (
                    <TeamCard 
                        key={team.id} 
                        team={team} 
                        onClick={() => {
                            setViewingTeam(team);
                            setView('team-summary');
                        }} 
                    />
                ))}
                </div>
            )}

            </div>
        </main>
      </div>
    </div>
  );
};


// --- App Entry Point (Loads Supabase) ---

export default function App() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    // 1. Check Config: If default, switch to Mock Mode
    if (supabaseUrl.includes('your-project-url')) {
      console.warn("Using Mock Supabase Client (No valid credentials found)");
      setSupabaseClient(new MockSupabaseClient());
      setIsMock(true);
      return;
    }

    // 2. Load Real Supabase if Config is present
    if (window.supabase) {
      setSupabaseClient(window.supabase.createClient(supabaseUrl, supabaseKey));
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        setSupabaseClient(window.supabase.createClient(supabaseUrl, supabaseKey));
      }
    };
    script.onerror = () => {
       alert("Failed to load Supabase SDK. Falling back to Mock Mode.");
       setSupabaseClient(new MockSupabaseClient());
       setIsMock(true);
    };
    document.body.appendChild(script);
  }, []);

  if (!supabaseClient) {
    return <LoadingScreen message="Initializing Database..." />;
  }

  return <VentureTracker supabase={supabaseClient} isMock={isMock} />;
}