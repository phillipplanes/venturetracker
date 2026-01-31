import React, { useState } from 'react';

const UserCreateModal = ({ onSave, onCancel, uploading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');

    const handleSave = () => {
        if (!email.trim() || !password.trim() || !fullName.trim()) {
            alert('Please fill out all fields.');
            return;
        }
        onSave({ email, password, fullName, role });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Create New User</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Full Name</label>
                        <input
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="e.g., Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="e.g., student@wfu.edu"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500">
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                        </select>
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
                        disabled={uploading}
                        className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                        {uploading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserCreateModal;