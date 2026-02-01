import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { 
  Rocket, Users, Layout, Settings, Calendar, Shield, LogOut
, DollarSign, ArrowLeft
} from 'lucide-react';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';
import CountdownBanner from './components/CountdownBanner';
import CreateOrJoinTeam from './components/CreateOrJoinTeam';
import UpdateFeed from './components/UpdateFeed';
import MilestoneTracker from './components/MilestoneTracker';
import ProfessorFeedback from './components/ProfessorFeedback';
import AdminDashboard from './components/AdminDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import PublicTeamProfile from './components/PublicTeamProfile';
import TeamCard from './components/TeamCard';
import TeamLogo from './components/TeamLogo';
import TeamProfileModal from './components/TeamProfileModal';
// REMOVED: import { createClient } from '@supabase/supabase-js'; (Not supported in this environment without build step)

// --- Configuration ---

// REPLACE THESE WITH YOUR SUPABASE PROJECT DETAILS
const supabaseUrl = 'https://hhtotufostcudindmofs.supabase.co';
const supabaseKey = 'sb_publishable_NoBszCAfvlvzwJEecv6ztw_59hx4CI_';
const ROOT_ADMIN_EMAIL = 'planesp@wfu.edu';
const STORAGE_BUCKET = 'venture-assets'; 

// --- Constants ---

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
const MOCK_PHASES = [
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
  }
];
const MOCK_COHORTS = [{ id: 'cohort-1', name: 'Demo Cohort' }];
const MOCK_MILESTONE_PHASES = MOCK_PHASES.map((p, i) => ({ ...p, cohort_id: 'cohort-1', order: i, tasks: undefined }));
const MOCK_MILESTONE_TASKS = MOCK_PHASES.flatMap(p => p.tasks.map((t, i) => ({ ...t, phase_id: p.id, order: i })));

class MockSupabaseClient {
  constructor() {
    this.teams = [...MOCK_TEAMS];
    this.updates = [...MOCK_UPDATES];
    this.transactions = [...MOCK_TRANSACTIONS];
    this.settings = { ...MOCK_SETTINGS };
    this.cohorts = [...MOCK_COHORTS];
    this.milestone_phases = [...MOCK_MILESTONE_PHASES];
    this.milestone_tasks = [...MOCK_MILESTONE_TASKS];
    this.cohort_join_requests = [];
    this.profiles = [];
    this.subs = {};
  }

  auth = {
    getSession: async () => ({ data: { session: { user: MOCK_USER } } }),
    signInWithOtp: async ({ email }) => {
       alert(`[DEMO] Magic link sent to ${email} (Check console to see pseudo-login)`);
       return { error: null };
    },
    signInWithPassword: async ({ email }) => {
       alert(`[DEMO] Signed in as ${email}`);
       return { error: null };
    },
    signUp: async ({ email }) => {
       alert(`[DEMO] Account created for ${email}`);
       return { error: null };
    },
    signInWithOAuth: async () => {
       alert(`[DEMO] OAuth login initiated.`);
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
             if (table === 'cohorts') data = self.cohorts;
             if (table === 'milestone_phases') data = self.milestone_phases.map(p => ({
               ...p,
               tasks: self.milestone_tasks.filter(t => t.phase_id === p.id)
             }));
             if (table === 'milestone_tasks') data = self.milestone_tasks;
             if (table === 'cohort_join_requests') data = self.cohort_join_requests;
             // Mock sort (simple)
             return { data, error: null };
          },
          in: (col, values) => {
             return {
                 order: async () => {
                    let data = [];
                    if (table === 'milestone_phases') {
                      data = self.milestone_phases
                        .filter(p => values.includes(p[col]))
                        .map(p => ({
                          ...p,
                          tasks: self.milestone_tasks.filter(t => t.phase_id === p.id)
                        }));
                    }
                    return { data, error: null };
                 }
             }
          },
          eq: (col, val) => {
             return {
                 order: async () => {
                    let data = [];
                    if (table === 'updates') data = self.updates;
                    if (table === 'transactions') data = self.transactions;
                    if (table === 'milestone_phases') {
                      data = self.milestone_phases
                        .filter(p => p[col] === val)
                        .map(p => ({
                          ...p,
                          tasks: self.milestone_tasks.filter(t => t.phase_id === p.id)
                        }));
                    }
                    if (table === 'cohort_join_requests') data = self.cohort_join_requests;
                    
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
        if (table === 'cohorts') self.cohorts.unshift(row);
        if (table === 'milestone_phases') self.milestone_phases.unshift(row);
        if (table === 'milestone_tasks') self.milestone_tasks.unshift(row);
        if (table === 'cohort_join_requests') self.cohort_join_requests.unshift(row);
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
            if (table === 'milestone_phases') {
                const idx = self.milestone_phases.findIndex(p => p[col] === val);
                if (idx > -1) self.milestone_phases[idx] = { ...self.milestone_phases[idx], ...updates };
            }
            if (table === 'milestone_tasks') {
                const idx = self.milestone_tasks.findIndex(t => t[col] === val);
                if (idx > -1) self.milestone_tasks[idx] = { ...self.milestone_tasks[idx], ...updates };
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
                if (table === 'milestone_phases') {
                    const idx = self.milestone_phases.findIndex(p => p[col] === val);
                    if (idx > -1) self.milestone_phases.splice(idx, 1);
                }
                if (table === 'milestone_tasks') {
                    const idx = self.milestone_tasks.findIndex(t => t[col] === val);
                    if (idx > -1) self.milestone_tasks.splice(idx, 1);
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

// --- Main Application Logic (VentureTracker) ---

const VentureTracker = ({ supabase, isMock }) => {
  const [session, setSession] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [settings, setSettings] = useState(null);
  const [phases, setPhases] = useState([]);
  const [cohortPhasesById, setCohortPhasesById] = useState({});
  const [cohorts, setCohorts] = useState([]);
  const [tags, setTags] = useState([]);
  const [teamTagIds, setTeamTagIds] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [joinRequest, setJoinRequest] = useState(null);
  const [joinCohortId, setJoinCohortId] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  
  const [view, setView] = useState('dashboard'); // 'dashboard', 'all-teams', 'finances', 'team-summary'
  const [viewingTeam, setViewingTeam] = useState(null); // The team being viewed in public directory
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      if (session?.user) ensureProfile(session.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Fetch Data (Teams & Settings)
  useEffect(() => {
    if (!session) return;

    ensureProfile(session.user);
    // Fetch Settings (runs once)
    supabase.from('settings').select('*').single().then(({ data }) => setSettings(data));

    // Initial Fetch Teams
    fetchTeams();
    fetchAdmins();
    fetchProfiles();
    fetchCohorts();
    fetchJoinRequest();
    fetchTags();

    // Set up Realtime Subscription for Teams
    const teamsSub = supabase.channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        fetchTeams(); 
      })
      .subscribe();

    // Set up Realtime Subscription for Cohorts (banner overrides)
    const cohortsSub = supabase.channel('public:cohorts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cohorts' }, () => {
        fetchCohorts();
      })
      .subscribe();

    const joinReqSub = supabase.channel('public:cohort_join_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_join_requests', filter: `user_id=eq.${session.user.id}` }, () => {
        fetchJoinRequest();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(teamsSub);
      supabase.removeChannel(cohortsSub);
      supabase.removeChannel(joinReqSub);
    };
  }, [session]);

  useEffect(() => {
    if (myTeam?.logo_url) {
      console.log('[Team Logo URL]', myTeam.logo_url);
    }
  }, [myTeam?.logo_url]);

  // Fetch milestones based on the current team's cohort
  useEffect(() => {
    const fetchTeamData = async () => {
      const team = view === 'team-summary' ? viewingTeam : myTeam;
      if (!team || !team.cohort_id) {
        setPhases([]); // Clear phases if no team or cohort
        return;
      }

      const { data: phaseData, error } = await supabase.from('milestone_phases').select('*, tasks:milestone_tasks(*)').eq('cohort_id', team.cohort_id).order('order');
      
      // Also fetch the submissions for this team
      const { data: submissionsData } = await supabase.from('team_submissions').select('*').eq('team_id', team.id);
      fetchTeamTags(team.id);
      
      if (submissionsData) {
          setAllTeams(prev => prev.map(t => t.id === team.id ? { ...t, team_submissions: submissionsData } : t));
      }

      if (error) {
        console.error("Error fetching milestones:", error);
        setPhases([]);
        return;
      }
      const sortedPhases = (phaseData || []).map(phase => ({
        ...phase,
        tasks: (phase.tasks || []).sort((a, b) => a.order - b.order)
      }));
      setPhases(sortedPhases);
    };

    fetchTeamData();
  }, [myTeam, viewingTeam, view]);

  // Fetch cohort-specific milestones for the class directory cards
  useEffect(() => {
    if (view !== 'all-teams' && view !== 'admin-dashboard') return;
    const cohortIds = Array.from(new Set(allTeams.map(t => t.cohort_id).filter(Boolean)));
    if (cohortIds.length === 0) {
      setCohortPhasesById({});
      return;
    }

    const fetchCohortMilestones = async () => {
      const { data, error } = await supabase
        .from('milestone_phases')
        .select('*, tasks:milestone_tasks(*)')
        .in('cohort_id', cohortIds)
        .order('order');

      if (error) {
        console.error("Error fetching cohort milestones:", error);
        return;
      }

      const grouped = {};
      for (const phase of data || []) {
        const tasks = (phase.tasks || []).sort((a, b) => a.order - b.order);
        if (!grouped[phase.cohort_id]) grouped[phase.cohort_id] = [];
        grouped[phase.cohort_id].push({ ...phase, tasks });
      }
      setCohortPhasesById(grouped);
    };

    fetchCohortMilestones();
  }, [allTeams, supabase, view]);

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*, team_submissions(*)').order('created_at', { ascending: false });
    if (data) {
        const enriched = await Promise.all(
          data.map(async (team) => {
            const evidence = team.task_evidence || {};
            const evidenceEntries = await Promise.all(
              Object.entries(evidence).map(async ([taskId, value]) => {
                const signed = await getSignedAssetUrl(value);
                const name = value ? value.split('/').pop() : '';
                return [taskId, { url: signed, name }];
              })
            );
            return {
              ...team,
              logo_display_url: await getSignedAssetUrl(team.logo_url),
              task_evidence_display: Object.fromEntries(evidenceEntries)
            };
          })
        );
        setAllTeams(enriched);
        const mine = enriched.find(t => t.members && t.members.includes(session.user.id));
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

  const fetchCohorts = async () => {
      const { data } = await supabase.from('cohorts').select('*').order('created_at', { ascending: false });
      if (data) setCohorts(data);
  };

  const fetchJoinRequest = async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('cohort_join_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching join request:', error);
        return;
      }
      const latest = Array.isArray(data) ? data[0] : data;
      if (latest) {
        setJoinRequest(latest);
        setJoinCohortId(latest.cohort_id || '');
      }
  };

  const handleSubmitJoinRequest = async () => {
      if (!joinCohortId || !session?.user) return;
      setJoinSubmitting(true);
      const { data, error } = await supabase
        .from('cohort_join_requests')
        .insert([{
          user_id: session.user.id,
          email: session.user.email,
          cohort_id: joinCohortId,
          status: 'pending'
        }])
        .select()
        .single();
      if (error) {
        alert('Failed to submit cohort request: ' + error.message);
      } else {
        setJoinRequest(data);
      }
      setJoinSubmitting(false);
  };

  const fetchProfiles = async () => {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setProfiles(data);
  };

  const ensureProfile = async (user) => {
      if (!user || isMock) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, email, full_name, avatar_url')
        .eq('id', user.id);
      if (error) {
        console.error('Failed to fetch profile:', error);
        return;
      }
      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: 'viewer'
          }]);
        if (insertError) {
          console.error('Failed to insert profile:', insertError);
          return;
        }
      } else {
        const existing = data[0];
        const updates = {};
        if (!existing.email && user.email) updates.email = user.email;
        if (!existing.full_name && (user.user_metadata?.full_name || user.user_metadata?.name)) {
          updates.full_name = user.user_metadata?.full_name || user.user_metadata?.name;
        }
        if (!existing.avatar_url && user.user_metadata?.avatar_url) updates.avatar_url = user.user_metadata?.avatar_url;
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);
          if (updateError) {
            console.error('Failed to update profile:', updateError);
          }
        }
      }
      fetchProfiles();
  };

  const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*').order('name', { ascending: true });
      if (data) setTags(data);
  };

  const fetchTeamTags = async (teamId) => {
      const { data } = await supabase.from('team_tags').select('tag_id').eq('team_id', teamId);
      if (data) setTeamTagIds(data.map(row => row.tag_id));
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
        if (data) {
            const enriched = await Promise.all(
              data.map(async (u) => ({
                ...u,
                image_display_url: await getSignedAssetUrl(u.image_url)
              }))
            );
            setUpdates(enriched);
        }
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
            const addUpdate = async () => {
              const image_display_url = await getSignedAssetUrl(payload.new.image_url);
              setUpdates(prev => [{ ...payload.new, image_display_url }, ...prev]);
            };
            addUpdate();
          }
      })
      .subscribe();

    return () => { supabase.removeChannel(updatesSub); }; // This might need a more robust key if view changes fast
  }, [myTeam, viewingTeam, view, supabase]);


  const getStoragePathInfo = (value) => {
    if (!value) return null;
    if (!value.startsWith('http')) {
      return { bucket: STORAGE_BUCKET, path: value };
    }
    try {
      const url = new URL(value);
      const parts = url.pathname.split('/').filter(Boolean);
      // Supports:
      // /storage/v1/object/public/{bucket}/{path}
      // /storage/v1/render/image/public/{bucket}/{path}
      const publicIdx = parts.indexOf('public');
      if (publicIdx > -1 && parts.length > publicIdx + 1) {
        const bucket = parts[publicIdx + 1];
        const path = parts.slice(publicIdx + 2).join('/');
        if (bucket && path) return { bucket, path };
      }
    } catch (e) {
      console.error('Invalid logo URL:', value);
    }
    return null;
  };

  const getSignedAssetUrl = async (value) => {
    const info = getStoragePathInfo(value);
    if (!info) return value || null;
    const { data, error } = await supabase.storage.from(info.bucket).createSignedUrl(info.path, 60 * 60);
    if (error) {
      console.error('Signed URL Error:', error);
      // If object is missing, fall back to the original value to avoid breaking the UI
      return value || null;
    }
    return data?.signedUrl || null;
  };

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
    
    // Store the path; generate signed URLs for display as needed
    return fileName;
  };

  // --- Actions ---

  const handleCreateTeam = async (name, description, logoFile) => {
    let logo_url = null;
    if (logoFile) {
        setUploading(true);
        logo_url = await uploadFile(logoFile, 'team-logos');
        setUploading(false);
    }
    const myProfile = profiles.find(p => p.id === session.user.id);
    const cohortId = myProfile?.cohort_id || (joinRequest?.status === 'approved' ? joinRequest.cohort_id : null);
    const { data, error } = await supabase.from('teams').insert([{
        name,
        description,
        logo_url,
        members: [session.user.id],
        submissions: {}, 
        task_evidence: {},
        cohort_id: cohortId
    }]).select();

    if (!error && data) {
        const created = data[0];
        const logo_display_url = await getSignedAssetUrl(created.logo_url);
        setMyTeam({ ...created, logo_display_url }); // Optimistic update
        setView('dashboard');
    }
  };

  const handleJoinTeam = async (teamId, currentMembers) => {
    const newMembers = [...(currentMembers || []), session.user.id];
    const { error } = await supabase.from('teams').update({ members: newMembers }).eq('id', teamId);
    if (!error) fetchTeams();
  };

  const handleAssignCohort = async (teamId, cohortId) => {
    const newCohortId = cohortId === '' ? null : cohortId;
    setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, cohort_id: newCohortId } : t));
    const { error } = await supabase
        .from('teams')
        .update({ cohort_id: newCohortId })
        .eq('id', teamId);
    if (error) {
        alert('Failed to assign cohort: ' + error.message);
        fetchTeams();
    } // The realtime subscription will trigger fetchTeams() on success
  };

  const handleAdminCreateTeam = async (teamData) => {
    setUploading(true);
    const { error } = await supabase.from('teams').insert([{
        name: teamData.name,
        description: teamData.description,
        members: [],
        submissions: {},
        task_evidence: {}
    }]);
    if (!error) fetchTeams();
    setUploading(false);
  };

  const handleAdminUpdateTeam = async (teamData) => {
    setUploading(true);
    const { error } = await supabase.from('teams').update({ name: teamData.name, description: teamData.description }).eq('id', teamData.id);
    if (!error) fetchTeams();
    setUploading(false);
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

  const handleSubmitTask = async (taskId, summary, file) => {
    if (!myTeam) return;

    setUploading(true);
    let evidencePath = null;
    if (file) {
        const safeName = file.name.replace(/\s/g, '_');
        evidencePath = await uploadFile(file, `team_${myTeam.id}/proof/${safeName}`);
    }

    const submissionData = {
        team_id: myTeam.id,
        task_id: taskId,
        status: 'pending',
        summary: summary,
        submitted_at: new Date().toISOString(),
    };

    // Upsert into the new team_submissions table
    const { error } = await supabase
        .from('team_submissions')
        .upsert(submissionData, { onConflict: 'team_id, task_id' })
        .select()
        .single();

    if (!error) {
        // Optimistic update
        const updateSubmissions = (team) => {
            if (!team) return null;
            const otherSubmissions = (team.team_submissions || []).filter(s => s.task_id !== taskId);
            return { ...team, team_submissions: [...otherSubmissions, submissionData] };
        };
        setMyTeam(updateSubmissions);
        setAllTeams(prev => prev.map(t => t.id === myTeam.id ? updateSubmissions(t) : t));

        if (evidencePath) {
            const signed = await getSignedAssetUrl(evidencePath);
            const newEvidence = { ...(myTeam.task_evidence || {}), [taskId]: evidencePath };
            const newEvidenceDisplay = { ...(myTeam.task_evidence_display || {}), [taskId]: { url: signed, name: file.name } };
            setMyTeam(prev => ({ ...prev, task_evidence: newEvidence, task_evidence_display: newEvidenceDisplay }));
            await supabase.from('teams').update({ task_evidence: newEvidence }).eq('id', myTeam.id);
        }
    } else {
        console.error("Error submitting task:", error);
        alert("Failed to submit task. Please check the console.");
    }
    setUploading(false);
  };

  const handleReviewTask = async (teamId, taskId, decision, feedback) => {
    const submissionData = {
        team_id: teamId,
        task_id: taskId,
        status: decision,
        feedback: feedback,
        reviewed_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('team_submissions')
        .upsert(submissionData, { onConflict: 'team_id, task_id' })
        .select()
        .single();

    if (!error) {
        // Optimistic update for admin view
        const updateSubmissions = (team) => {
            if (!team) return null;
            const otherSubmissions = (team.team_submissions || []).filter(s => s.task_id !== taskId);
            return { ...team, team_submissions: [...otherSubmissions, submissionData] };
        };
        setMyTeam(prev => updateSubmissions(prev));
        setAllTeams(prev => prev.map(t => t.id === teamId ? updateSubmissions(t) : t));
    }
  };

  const handleUploadProof = async (taskId, file) => {
      if (!myTeam || !file) return;
      setUploading(true);
      const safeName = file.name.replace(/\s/g, '_');
      const path = await uploadFile(file, `team_${myTeam.id}/proof/${safeName}`);
      if (path) {
        const newEvidence = { ...(myTeam.task_evidence || {}), [taskId]: path };
        const signed = await getSignedAssetUrl(path);
        const newEvidenceDisplay = {
          ...(myTeam.task_evidence_display || {}),
          [taskId]: { url: signed, name: file.name }
        };
        setMyTeam(prev => ({ ...prev, task_evidence: newEvidence, task_evidence_display: newEvidenceDisplay }));
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
          author_id: session.user.id,
          author_email: session.user.email
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
      setUploading(true);
      const { data, error } = await supabase.rpc('upsert_settings', {
        settings_data: newSettings
      }).single();


      if (!error && data) {
          if (data) setSettings(data);
      } else {
          console.error("Error updating settings:", error);
          alert("Failed to save settings. Check the console for details.");
      }
      setUploading(false);
  };

  const handleUpdateProfile = async (id, updates) => {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
      if (error) console.error("Error updating profile:", error);
  };

  const handleUpdateTeamProfile = async ({ description, logoFile }) => {
      if (!myTeam) return;
      setUploading(true);
      let logo_url = myTeam.logo_url;
      if (logoFile) {
          logo_url = await uploadFile(logoFile, 'team-logos');
      }
      if (logo_url) console.log('[Team Logo URL]', logo_url);
      const updates = { description: description.trim(), logo_url };
      const { error } = await supabase.from('teams').update(updates).eq('id', myTeam.id);
      if (error) {
          console.error("Error updating team profile:", error);
          alert("Failed to update team profile. Check the console.");
      } else {
          const logo_display_url = await getSignedAssetUrl(logo_url);
          const nextTeam = { ...updates, logo_display_url };
          setMyTeam(prev => (prev ? { ...prev, ...nextTeam } : prev));
          setAllTeams(prev => prev.map(t => (t.id === myTeam.id ? { ...t, ...nextTeam } : t)));
          setViewingTeam(prev => (prev && prev.id === myTeam.id ? { ...prev, ...nextTeam } : prev));
          setIsEditingProfile(false);
      }
      setUploading(false);
  };

  const handleSaveTeamTags = async (nextTagIds) => {
      if (!myTeam) return;
      setUploading(true);
      const { error: deleteError } = await supabase.from('team_tags').delete().eq('team_id', myTeam.id);
      if (deleteError) {
          console.error("Error clearing team tags:", deleteError);
          setUploading(false);
          return;
      }
      if (nextTagIds.length > 0) {
          const rows = nextTagIds.map(tag_id => ({ team_id: myTeam.id, tag_id }));
          const { error: insertError } = await supabase.from('team_tags').insert(rows);
          if (insertError) {
              console.error("Error saving team tags:", insertError);
              setUploading(false);
              return;
          }
      }
      setTeamTagIds(nextTagIds);
      setUploading(false);
  };

  const handleCreateUser = async (userData) => {
      setUploading(true);
      const { email, password, fullName, role } = userData;
      const { error } = await supabase.rpc('create_test_user', {
          email: email,
          password: password,
          metadata: {
              full_name: fullName,
              role: role
          }
      });

      if (!error) fetchProfiles();
      else alert(`Failed to create user: ${error.message}`);
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

  const handleDeleteTeam = async (teamId) => {
      setUploading(true);
      
      // 1. Delete Updates
      const { error: updatesError } = await supabase.from('updates').delete().eq('team_id', teamId);
      if (updatesError) console.error("Error deleting updates:", updatesError);

      // 2. Delete Transactions
      const { error: txError } = await supabase.from('transactions').delete().eq('team_id', teamId);
      if (txError) console.error("Error deleting transactions:", txError);

      // 3. Delete Milestone Submissions
      const { error: submissionsError } = await supabase.from('team_submissions').delete().eq('team_id', teamId);
      if (submissionsError) console.error("Error deleting submissions:", submissionsError);

      // 4. Delete Team
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      
      if (!error) {
          setAllTeams(prev => prev.filter(t => t.id !== teamId));
          if (myTeam?.id === teamId) setMyTeam(null);
          if (viewingTeam?.id === teamId) setViewingTeam(null);
      } else {
          alert("Failed to delete team: " + error.message);
      }
      setUploading(false);
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

  const handleDeleteUser = async (profile) => {
      if (!profile) return;
      const confirmText = `Delete ${profile.email || 'this user'}? This removes their profile and unassigns them from teams.`;
      if (!window.confirm(confirmText)) return;
      setUploading(true);
      try {
        const affectedTeams = allTeams.filter(t => (t.members || []).includes(profile.id));
        await Promise.all(
          affectedTeams.map(team => {
            const nextMembers = (team.members || []).filter(id => id !== profile.id);
            return supabase.from('teams').update({ members: nextMembers }).eq('id', team.id);
          })
        );
        const adminRow = adminList.find(a => a.email === profile.email);
        if (adminRow) {
          await supabase.from('admins').delete().eq('id', adminRow.id);
        }
        await supabase.from('profiles').delete().eq('id', profile.id);
        await fetchTeams();
        await fetchAdmins();
        await fetchProfiles();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Check console for details.');
      } finally {
        setUploading(false);
      }
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

  const getBannerMessage = () => {
    const teamForBanner = view === 'team-summary' ? viewingTeam : myTeam;
    const cohort = cohorts.find(c => c.id === teamForBanner?.cohort_id);
    return cohort?.banner_message || settings?.banner_message;
  };
  const getPitchDate = () => {
    const teamForBanner = view === 'team-summary' ? viewingTeam : myTeam;
    const cohort = cohorts.find(c => c.id === teamForBanner?.cohort_id);
    return cohort?.pitch_date || settings?.pitch_date;
  };

  if (view === 'admin-dashboard' && isAuthorizedAdmin) {
      return (
          <div className="min-h-screen bg-black flex flex-col">
              <CountdownBanner targetDate={getPitchDate()} message={getBannerMessage()} />
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
                  teams={allTeams} admins={adminList} profiles={profiles} settings={settings}
                  cohortPhasesById={cohortPhasesById}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateProfile={handleUpdateProfile}
                  onAddAdmin={handleAddAdmin} onRemoveAdmin={handleRemoveAdmin}
                  onViewTeam={handleAdminViewTeam} onDeleteTeam={handleDeleteTeam}
                  uploading={uploading}
                  onCreateTeam={handleAdminCreateTeam}
                  onUpdateTeam={handleAdminUpdateTeam}
                  onCreateUser={handleCreateUser}
                  onDeleteUser={handleDeleteUser}
                  onAssignCohort={handleAssignCohort}
                  supabase={supabase}
              />
          </div>
      );
  }

  if (!myTeam) {
    const activeCohorts = cohorts.filter(c => (c.status || 'active') === 'active');
    const requestedCohort = cohorts.find(c => c.id === joinRequest?.cohort_id);
    const myProfile = profiles.find(p => p.id === session.user.id);
    const isApproved = joinRequest?.status === 'approved' || Boolean(myProfile?.cohort_id);
    const isPending = joinRequest?.status === 'pending';
    return (
      <div className="min-h-screen bg-black flex flex-col text-white">
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
        <div className="px-4 md:px-8 py-10 max-w-3xl mx-auto w-full">
          {!isApproved && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Cohort</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Choose the cohort you want to join. The admins will be alerted to approve and assign your team.
              </p>
              {joinRequest ? (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                  <p className="text-sm text-neutral-300">
                    Request submitted for{' '}
                    <span className="text-yellow-500 font-semibold">
                      {requestedCohort?.name || 'your cohort'}
                    </span>.
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Status: <span className="uppercase font-bold text-yellow-500">{joinRequest.status || 'pending'}</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-3">
                    You’ll be added to your cohort by the admins soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <select
                    value={joinCohortId}
                    onChange={(e) => setJoinCohortId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500"
                  >
                    <option value="">Select an active cohort...</option>
                    {activeCohorts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSubmitJoinRequest}
                    disabled={!joinCohortId || joinSubmitting}
                    className="w-full bg-yellow-600 text-black font-bold py-3 rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                  >
                    {joinSubmitting ? 'Submitting...' : 'Request Cohort Access'}
                  </button>
                  {activeCohorts.length === 0 && (
                    <p className="text-xs text-neutral-500">No active cohorts are available right now.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {isApproved && (
            <div className="mt-2">
              <CreateOrJoinTeam user={session.user} teams={allTeams} onJoin={handleJoinTeam} onCreate={handleCreateTeam} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Header Logic
  const currentDisplayTeam = view === 'team-summary' ? viewingTeam : myTeam;
  const submissions = currentDisplayTeam?.team_submissions
    ? currentDisplayTeam.team_submissions.reduce((acc, sub) => {
        acc[sub.task_id] = sub;
        return acc;
      }, {})
    : (currentDisplayTeam?.submissions || {});
  const taskIdSet = new Set(phases.flatMap(p => (p.tasks || []).map(t => t.id)));
  const totalTasks = taskIdSet.size;
  const approvedCount = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'approved').length;
  const progressPercent = totalTasks > 0 ? Math.round((approvedCount / totalTasks) * 100) : 0;

  const handleHomeNav = () => {
    setView(isAuthorizedAdmin ? 'admin-dashboard' : 'dashboard');
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white overflow-x-hidden">
      {isMock && (
          <div className="bg-yellow-600 text-black text-center py-1 text-xs font-bold uppercase tracking-widest z-50">
            Demo Mode (Data is not saved)
          </div>
      )}
      <CountdownBanner targetDate={getPitchDate()} message={getBannerMessage()} />
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 w-full">
        <button
          onClick={handleHomeNav}
          className="flex items-center gap-2 hover:text-white"
        >
          <Rocket className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-white">VentureTracker</span>
        </button>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-sm text-neutral-300 border border-neutral-800 px-3 py-1.5 rounded-lg hover:bg-neutral-900"
        >
          Menu
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`md:w-64 bg-neutral-950 border-r border-neutral-800 flex-shrink-0 flex flex-col h-full md:static fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="p-6 border-b border-neutral-800">
            <button
              onClick={handleHomeNav}
              className="flex items-center gap-2 mb-1 hover:text-white"
            >
                <Rocket className="w-6 h-6 text-yellow-500" />
                <span className="font-bold text-white">VentureTracker</span>
            </button>
            <p className="text-xs text-neutral-500">Class of Spring 2026</p>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-2 px-2">Student</p>
                <div className="space-y-2">
                  <button onClick={() => { setSidebarOpen(false); handleResetToMyTeam(); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${view === 'dashboard' ? 'bg-yellow-900/20 text-yellow-500 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
                      <Layout className="w-5 h-5" /> My Dashboard
                  </button>
                  <button onClick={() => { setView('finances'); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${view === 'finances' ? 'bg-yellow-900/20 text-yellow-500 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
                      <DollarSign className="w-5 h-5" /> Finances
                  </button>
                  <button onClick={() => { setView('all-teams'); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${view === 'all-teams' ? 'bg-yellow-900/20 text-yellow-500 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
                      <Users className="w-5 h-5" /> Class Directory
                  </button>
                </div>
              </div>

              {isAuthorizedAdmin && (
                <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold mb-2">Admin</p>
                  <button onClick={() => { setView('admin-dashboard'); setSidebarOpen(false); }} className={`w-full py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition mb-2 ${view === 'admin-dashboard' ? 'bg-yellow-900/20 text-yellow-500' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}>
                      <Settings className="w-3 h-3" /> Admin Dashboard
                  </button>
                  <button onClick={() => setIsAdmin(!isAdmin)} className={`w-full py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition ${isAdmin ? 'bg-red-900/50 text-red-200' : 'bg-neutral-800 text-neutral-400'}`}>
                      <Shield className="w-3 h-3" />
                      {isAdmin ? 'Admin View Active' : 'Switch to Admin'}
                  </button>
                </div>
              )}

              <button onClick={() => { setSidebarOpen(false); supabase.auth.signOut(); }} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
                  <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>

        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-black w-full">
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
            
            <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
            
            {/* Dashboard (My Team) */}
            {view === 'dashboard' && (
                <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-4">
                                <TeamLogo url={myTeam?.logo_display_url || myTeam?.logo_url} name={myTeam?.name} className="w-16 h-16 rounded-lg" iconSize="w-8 h-8" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">{myTeam?.name}</h2>
                                    <p className="text-neutral-400 mt-1">{myTeam?.description}</p>
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="mt-2 text-xs text-neutral-400 hover:text-white underline underline-offset-4"
                                    >
                                        Edit description and logo
                                    </button>
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
                        phases={phases}
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
                    phases={phases} 
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
                        phasesByCohort={cohortPhasesById}
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
      {isEditingProfile && (
        <TeamProfileModal
          team={myTeam}
          uploading={uploading}
          tags={tags}
          selectedTagIds={teamTagIds}
          onCancel={() => setIsEditingProfile(false)}
          onSave={handleUpdateTeamProfile}
          onSaveTags={handleSaveTeamTags}
        />
      )}
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
