import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';

const TeamProfileModal = ({ team, uploading, onCancel, onSave, tags = [], selectedTagIds = [], onSaveTags }) => {
  const [description, setDescription] = useState(team?.description || '');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [tagIds, setTagIds] = useState(selectedTagIds);

  useEffect(() => {
    if (!logoFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    setTagIds(selectedTagIds);
  }, [selectedTagIds]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Edit Team Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Team Logo</label>
            <div className="flex items-center gap-4">
              <label className="w-16 h-16 bg-neutral-950 border border-neutral-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-500 overflow-hidden group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (team?.logo_display_url || team?.logo_url) ? (
                  <img src={team.logo_display_url || team.logo_url} alt="Team logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-neutral-600 group-hover:text-yellow-500" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
                  }}
                />
              </label>
              <div className="text-xs text-neutral-500">
                <div>Click to upload a new logo.</div>
                {logoFile && <div className="mt-1 text-neutral-400">{logoFile.name}</div>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Short Description</label>
            <textarea
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-yellow-500 h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A one-liner about the venture."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Project Tags</label>
            {tags.length === 0 ? (
              <p className="text-xs text-neutral-500">No tags available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const checked = tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setTagIds(prev => checked ? prev.filter(id => id !== tag.id) : [...prev, tag.id]);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        checked
                          ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-yellow-600/50 hover:text-yellow-200'
                      }`}
                    >
                      {tag.label || tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-neutral-400 hover:text-white text-sm">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ description, logoFile });
              if (onSaveTags) onSaveTags(tagIds);
            }}
            disabled={uploading || !description.trim()}
            className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {uploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamProfileModal;
