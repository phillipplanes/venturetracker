import React, { useMemo, useRef, useState } from 'react';
import { MessageSquare, Camera, X, Search, Image as ImageIcon, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

const UpdateFeed = ({ updates, onPostUpdate, uploading, readOnly = false }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [query, setQuery] = useState('');
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const fileInputRef = useRef(null);

  const filteredUpdates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? updates.filter((u) => (u.content || '').toLowerCase().includes(q))
      : updates;
    const photosFiltered = withPhotosOnly
      ? list.filter((u) => u.image_display_url || u.image_url)
      : list;
    const sorted = [...photosFiltered].sort((a, b) =>
      sortNewest ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)
    );
    return sorted;
  }, [updates, query, withPhotosOnly, sortNewest]);

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

      <div className="bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-yellow-500" />
            Weekly Updates
          </h3>
          <span className="text-xs text-neutral-500">{updates.length} total</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(6);
              }}
              placeholder="Search updates..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
            />
          </div>
          <button
            onClick={() => setWithPhotosOnly((v) => !v)}
            className={`text-xs px-3 py-2 rounded-md font-medium border transition flex items-center gap-2 ${
              withPhotosOnly ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos
          </button>
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-md font-medium border border-neutral-700 flex items-center gap-2"
          >
            {sortNewest ? <ArrowDownWideNarrow className="w-3.5 h-3.5" /> : <ArrowUpWideNarrow className="w-3.5 h-3.5" />}
            {sortNewest ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUpdates.length === 0 ? <div className="text-center py-8 text-neutral-600 text-sm">No updates available.</div> : filteredUpdates.slice(0, visibleCount).map((update) => (
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
            {(update.image_display_url || update.image_url) && (
              <div className="mt-2 rounded-lg overflow-hidden border border-neutral-800">
                <img src={update.image_display_url || update.image_url} alt="Update attachment" className="w-full h-auto object-cover max-h-64" />
              </div>
            )}
          </div>
        ))}
        {filteredUpdates.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((c) => c + 6)}
            className="w-full text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg py-2"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateFeed;
