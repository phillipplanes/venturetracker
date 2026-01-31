import React, { useState } from 'react';

const SubmissionModal = ({ task, existingSummary, onSubmit, onCancel }) => {
    const [summary, setSummary] = useState(existingSummary || '');

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Submit Milestone</h3>
                <p className="text-sm text-neutral-400 mb-4">{task.label}</p>
                
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-2">
                    What did you do? (Summary)
                </label>
                <textarea 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm h-32 focus:border-yellow-500 outline-none"
                    placeholder="Describe your work, findings, or results..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                />
                
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSubmit(summary)}
                        disabled={!summary.trim()}
                        className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                        Submit for Approval
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;