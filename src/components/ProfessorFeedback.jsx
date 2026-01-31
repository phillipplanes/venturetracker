import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

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
                            <div>
                                <span className="text-yellow-500 text-xs font-bold uppercase">Admin Note</span>
                                {item.author_email && <span className="text-neutral-500 text-xs ml-2">— {item.author_email}</span>}
                            </div>
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

export default ProfessorFeedback;