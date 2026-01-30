export const PHASES = [];

export const MOCK_USER = { id: 'mock-user-1', email: 'student@university.edu' };

export const MOCK_PROFILES = [
  { id: 'mock-user-1', email: 'student@university.edu', status: 'active', admin_notes: 'Student lead for EcoBox.' },
  { id: 'mock-user-2', email: 'founder@campuseats.edu', status: 'active', admin_notes: '' },
  { id: 'mock-user-3', email: 'teammate@ecobox.edu', status: 'suspended', admin_notes: 'Academic probation.' }
];

export const MOCK_TEAMS = [
  { 
    id: 'team-1', 
    name: 'EcoBox', 
    logo_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=150&q=80',
    description: 'We help e-commerce brands reduce plastic waste by providing reusable, durable packaging that customers return for rewards. Sustainable shipping made simple.', 
    members: ['mock-user-1', 'mock-user-2', 'mock-user-3'], 
    submissions: {},
    task_evidence: {},
    created_at: new Date().toISOString()
  },
  // ... other mock teams can be added here
];

export const MOCK_UPDATES = []; // Simplified for brevity in this file, you can move the full array here
export const MOCK_TRANSACTIONS = []; // Simplified for brevity
export const MOCK_SETTINGS = { banner_message: 'Welcome to Demo Mode! Configure Supabase to go live.', pitch_date: new Date(Date.now() + 86400000 * 30).toISOString() };