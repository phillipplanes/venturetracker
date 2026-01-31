import React, { useState, useRef } from 'react';
import { MessageSquare, Camera, X } from 'lucide-react';

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

export default UpdateFeed;