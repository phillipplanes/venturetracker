import { MOCK_USER, MOCK_TEAMS, MOCK_UPDATES, MOCK_TRANSACTIONS, MOCK_SETTINGS, MOCK_PROFILES } from '../constants';

export class MockSupabaseClient {
  constructor() {
    this.teams = [...MOCK_TEAMS];
    this.updates = [...MOCK_UPDATES];
    this.transactions = [...MOCK_TRANSACTIONS];
    this.settings = { ...MOCK_SETTINGS };
    this.profiles = [...MOCK_PROFILES];
    this.subs = {};
  }

  auth = {
    getSession: async () => ({ data: { session: { user: MOCK_USER } } }),
    signInWithOtp: async ({ email }) => {
       alert(`[DEMO] Magic link sent to ${email} (Check console to see pseudo-login)`);
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
             if (table === 'profiles') data = self.profiles;
             if (table === 'settings') data = [self.settings];
             // Mock sort (simple)
             return { 
                 data, 
                 error: null,
                 limit: () => ({
                     single: async () => ({ data: data[0] || null, error: null })
                 })
             };
          },
          eq: (col, val) => {
             return {
                 single: async () => {
                    let data = [];
                    if (table === 'settings') return { data: self.settings, error: null };
                    return { data: null, error: null };
                 },
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
        if (table === 'settings') {
            self.settings = { ...row };
            return { data: [row], error: null };
        }
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
            if (table === 'profiles') {
               const idx = self.profiles.findIndex(t => t[col] === val);
               if (idx > -1) self.profiles[idx] = { ...self.profiles[idx], ...updates };
            }
            if (table === 'settings') {
               self.settings = { ...self.settings, ...updates };
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
        return { unsubscribe: () => {} };
      }
    };
    return channelStub;
  }
  removeChannel() {}
}