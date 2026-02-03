import React, { useRef, useState } from 'react';
import { Paperclip, X, Link as LinkIcon } from 'lucide-react';

const SubmissionModal = ({
    task,
    existingSummary,
    onSubmit,
    onCancel,
    readOnly = false,
    attachmentUrl,
    attachmentName,
    existingEstimatedHours
}) => {
    const [summary, setSummary] = useState(existingSummary || '');
    const [file, setFile] = useState(null);
    const [estimatedHours, setEstimatedHours] = useState(
        Number.isFinite(existingEstimatedHours) ? String(existingEstimatedHours) : ''
    );
    const fileInputRef = useRef(null);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">
                    {readOnly ? 'Milestone Details' : 'Submit Milestone'}
                </h3>
                <p className="text-sm text-neutral-400 mb-4">{task.label}</p>
                
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-2">
                    What did you do? (Summary)
                </label>
                <textarea 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm h-32 focus:border-yellow-500 outline-none"
                    placeholder="Describe your work, findings, or results..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    readOnly={readOnly}
                />

                <div className="mt-4">
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">
                        Estimated Time (hours, optional)
                    </label>
                    {readOnly ? (
                        <div className="text-sm text-neutral-300">
                            {existingEstimatedHours ? `${existingEstimatedHours} hours` : 'Not provided'}
                        </div>
                    ) : (
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                            placeholder="e.g., 3"
                        />
                    )}
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">
                        Attach Evidence (optional)
                    </label>
                    {attachmentUrl && (
                        <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-2 inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2"
                        >
                            <LinkIcon className="w-4 h-4" />
                            {attachmentName || 'View attachment'}
                        </a>
                    )}
                    {!readOnly && file ? (
                        <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300">
                            <span className="truncate max-w-[240px]">{file.name}</span>
                            <button onClick={() => setFile(null)} className="text-neutral-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : !readOnly ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-400 hover:text-white hover:border-yellow-600 transition flex items-center justify-center gap-2"
                        >
                            <Paperclip className="w-4 h-4" />
                            Add a file (PDF, image, doc, etc.)
                        </button>
                    ) : null}
                    {!readOnly && (
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="*/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                        />
                    )}
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                    >
                        {readOnly ? 'Close' : 'Cancel'}
                    </button>
                    {!readOnly && (
                        <button 
                            onClick={() => {
                                const parsed = estimatedHours.trim() === '' ? null : Number.parseFloat(estimatedHours);
                                onSubmit(summary, file, Number.isNaN(parsed) ? null : parsed);
                            }}
                            disabled={!summary.trim()}
                            className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                        >
                            Submit for Approval
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;
