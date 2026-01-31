import React, { useMemo, useState } from 'react';
import { MessageSquare, Search, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

const ProfessorFeedback = ({ team, isAdmin, onPostFeedback, uploading }) => {
    const [note, setNote] = useState('');
    const [query, setQuery] = useState('');
    const [sortNewest, setSortNewest] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);
    const feedbackList = team.feedback || [];

    const filteredFeedback = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = q
            ? feedbackList.filter((f) =>
                (f.content || '').toLowerCase().includes(q) ||
                (f.author_email || '').toLowerCase().includes(q)
              )
            : feedbackList;
        const sorted = [...list].sort((a, b) =>
            sortNewest ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)
        );
        return sorted;
    }, [feedbackList, query, sortNewest]);

    const handleSubmit = () => {
        if (!note.trim()) return;
        onPostFeedback(note);
        setNote('');
    };

    if (!isAdmin && feedbackList.length === 0) return null;

    return (
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-yellow-500" />
                    Professor Feedback
                </h3>
                <span className="text-xs text-neutral-500">{feedbackList.length} total</span>
            </div>

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

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setVisibleCount(6);
                        }}
                        placeholder="Search notes or author..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                    />
                </div>
                <button
                    onClick={() => setSortNewest(!sortNewest)}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-md font-medium border border-neutral-700 flex items-center gap-2"
                >
                    {sortNewest ? <ArrowDownWideNarrow className="w-3.5 h-3.5" /> : <ArrowUpWideNarrow className="w-3.5 h-3.5" />}
                    {sortNewest ? 'Newest' : 'Oldest'}
                </button>
            </div>

            <div className="space-y-4">
                {filteredFeedback.slice(0, visibleCount).map((item, idx) => (
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
                {filteredFeedback.length === 0 && isAdmin && (
                    <p className="text-neutral-600 text-sm italic text-center">No feedback notes yet.</p>
                )}
                {filteredFeedback.length > visibleCount && (
                    <button
                        onClick={() => setVisibleCount((c) => c + 6)}
                        className="w-full text-xs text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg py-2"
                    >
                        Show more
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfessorFeedback;
