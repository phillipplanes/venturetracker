import React, { useState } from 'react';

const TeamEditModal = ({ team, onSave, onCancel, uploading }) => {
    const [name, setName] = useState(team?.name || '');
    const [description, setDescription] = useState(team?.description || '');
    const isCreating = !team?.id;

    const handleSave = () => {
        onSave({ ...team, name, description });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">{isCreating ? 'Create New Team' : 'Edit Team'}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Team Name</label>
                        <input
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Venture Name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                        <textarea
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500 h-24 resize-none"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="A one-liner about the venture."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || uploading}
                        className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                        {uploading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamEditModal;