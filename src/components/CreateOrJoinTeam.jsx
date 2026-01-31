import React, { useState, useRef } from 'react';
import { Plus, Camera } from 'lucide-react';

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

export default CreateOrJoinTeam;