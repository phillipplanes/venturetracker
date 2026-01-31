import React, { useState, useRef } from 'react';
import { CheckCircle2, Circle, Target, Clock, AlertCircle, Upload, Link as LinkIcon, X, Check } from 'lucide-react';
import SubmissionModal from './SubmissionModal';

const ReviewPanel = ({ teamId, taskId, currentStatus, submission, onReview }) => {
    const [note, setNote] = useState('');
    
    if (currentStatus === 'approved') return null;

    return (
        <div className="mt-2 pl-8 pb-2">
            <div className="bg-neutral-950 border border-neutral-800 rounded p-3 text-sm">
                <p className="text-neutral-400 text-xs uppercase font-bold mb-2">Student Submission</p>
                <div className="bg-neutral-900 p-2 rounded text-neutral-300 text-sm mb-3 border border-neutral-800 italic">
                    "{submission.summary || "No summary provided."}"
                </div>

                <p className="text-neutral-400 text-xs uppercase font-bold mb-2">Admin Feedback</p>
                <input 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white mb-2 text-xs"
                    placeholder="Feedback for the team (optional)..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
                <div className="flex gap-2">
                    <button 
                        onClick={() => onReview(teamId, taskId, 'approved', note)}
                        className="bg-green-800 hover:bg-green-700 text-green-100 text-xs px-3 py-1 rounded flex items-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Approve
                    </button>
                    <button 
                        onClick={() => onReview(teamId, taskId, 'rejected', note)}
                        className="bg-red-900/50 hover:bg-red-900 text-red-200 text-xs px-3 py-1 rounded flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Reject
                    </button>
                </div>
            </div>
        </div>
    )
}

const MilestoneTracker = ({ team, phases, onSubmitTask, onReviewTask, onUploadProof, uploading, isAdmin, readOnly = false }) => {
    // Create a map of submissions for easy lookup
    const submissionList = team.team_submissions || Object.entries(team.submissions || {}).map(([taskId, sub]) => ({ task_id: taskId, ...sub }));
    const submissions = submissionList.reduce((acc, sub) => {
        acc[sub.task_id] = sub;
        return acc;
    }, {});
    const taskEvidence = team.task_evidence_display || team.task_evidence || {}; 
    const fileInputRef = useRef(null);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [expandedReview, setExpandedReview] = useState(null);
    const [submissionTask, setSubmissionTask] = useState(null);
    const [isViewingSubmission, setIsViewingSubmission] = useState(false);

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0] && activeTaskId) {
        onUploadProof(activeTaskId, e.target.files[0]);
        setActiveTaskId(null); // Reset
      }
    };

    const triggerUpload = (taskId) => {
      setActiveTaskId(taskId);
      setTimeout(() => fileInputRef.current?.click(), 0);
    };

    const approvedCount = Object.values(submissions).filter(s => s.status === 'approved').length;
    
    return (
      <>
        {submissionTask && (
            <SubmissionModal 
                task={submissionTask}
                existingSummary={submissions[submissionTask.id]?.summary}
                attachmentUrl={
                    (() => {
                        const proof = taskEvidence[submissionTask.id];
                        return typeof proof === 'string' ? proof : proof?.url;
                    })()
                }
                attachmentName={
                    (() => {
                        const proof = taskEvidence[submissionTask.id];
                        return typeof proof === 'string' ? '' : proof?.name;
                    })()
                }
                readOnly={isViewingSubmission}
                onSubmit={(summary, file) => {
                    onSubmitTask(submissionTask.id, summary, file);
                    setSubmissionTask(null);
                    setIsViewingSubmission(false);
                }}
                onCancel={() => {
                    setSubmissionTask(null);
                    setIsViewingSubmission(false);
                }}
            />
        )}

        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden">
            <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="*/*"
            onChange={handleFileChange}
            />
            <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-500" />
                Venture Roadmap
            </h3>
            <span className="text-xs font-mono bg-neutral-800 border border-neutral-700 text-neutral-400 px-2 py-1 rounded">
                {approvedCount} / {phases.reduce((a,b)=>a+b.tasks.length,0)} Approved
            </span>
            </div>
            
            <div className="p-4 space-y-6">
            {phases.map((phase, idx) => {
                const phaseTasks = phase.tasks;
                const approvedInPhase = phaseTasks.filter(t => submissions[t.id]?.status === 'approved').length;
                const isPhaseComplete = approvedInPhase === phaseTasks.length;
    
                return (
                <div key={phase.id} className="relative pl-6 border-l-2 border-neutral-800 last:border-0">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isPhaseComplete ? 'bg-yellow-500 border-yellow-500' : 'bg-neutral-900 border-neutral-700'}`}>
                    {isPhaseComplete && <CheckCircle2 className="w-3 h-3 text-black absolute top-0 left-0" />}
                    </div>
                    
                    <h4 className="text-sm font-bold text-neutral-200 mb-3 flex items-center justify-between">
                    {phase.title}
                    <span className="text-xs font-normal text-neutral-500">{approvedInPhase}/{phaseTasks.length}</span>
                    </h4>
                    
                    <div className="space-y-2">
                    {phase.tasks.map(task => {
                        const submission = submissions[task.id] || {};
                        const status = submission.status || 'incomplete';
                        const hasProof = taskEvidence[task.id];
                        const proofUrl = typeof hasProof === 'string' ? hasProof : hasProof?.url;
                        const proofName = typeof hasProof === 'string' ? '' : hasProof?.name;

                        let statusIcon = <Circle className="w-3.5 h-3.5 text-neutral-600" />;
                        let statusClass = "hover:bg-neutral-800";
                        let statusText = "text-neutral-300";

                        if (status === 'approved') {
                            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
                            statusClass = "bg-green-950/20 border-green-900/30";
                            statusText = "text-green-400";
                        } else if (status === 'pending') {
                            statusIcon = <Clock className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />;
                            statusClass = "bg-yellow-950/20 border-yellow-900/30";
                            statusText = "text-yellow-500";
                        } else if (status === 'rejected') {
                            statusIcon = <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
                            statusText = "text-red-400";
                        }

                        if (readOnly) {
                            statusClass = "border-transparent bg-neutral-900/30"; // Static style for read-only
                        }

                        return (
                        <div key={task.id} className="flex flex-col">
                            <div className={`flex items-center justify-between gap-3 p-2 rounded-lg transition-colors border ${statusClass}`}>
                                <div className={`flex items-start gap-3 flex-1 ${!readOnly ? 'cursor-pointer' : ''}`} onClick={() => {
                                    if (readOnly) return;
                                    if (status === 'approved') {
                                        setSubmissionTask(task);
                                        setIsViewingSubmission(true);
                                        return;
                                    }
                                    if (isAdmin) {
                                        setExpandedReview(expandedReview === task.id ? null : task.id);
                                    } else {
                                        if (status === 'incomplete' || status === 'rejected') {
                                            setSubmissionTask(task);
                                            setIsViewingSubmission(false);
                                        }
                                    }
                                }}>
                                    <div className="relative flex items-center mt-0.5">
                                        {statusIcon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm ${status === 'approved' ? 'line-through opacity-70' : ''} ${statusText}`}>
                                            {task.label}
                                        </span>
                                        {status === 'pending' && <span className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider">Pending Approval</span>}
                                        {status === 'approved' && <span className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Approved</span>}
                                        
                                        {!readOnly && status === 'rejected' && submission.feedback && (
                                            <span className="text-xs text-red-400 mt-1">Feedback: "{submission.feedback}"</span>
                                        )}
                                        {!readOnly && submission.notes && <span className="text-xs text-neutral-500 mt-1 italic">"{submission.notes}"</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                {!readOnly && proofUrl && (
                                    <a 
                                    href={proofUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 p-1" 
                                    title="View Proof"
                                    onClick={(e) => e.stopPropagation()}
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </a>
                                )}
                                {!readOnly && !isAdmin && status !== 'approved' && (
                                    <button 
                                        className={`${hasProof ? 'text-yellow-500' : 'text-neutral-500'} hover:text-yellow-500 p-1`}
                                        title={hasProof ? "Replace Evidence (any file)" : "Upload Evidence (any file)"}
                                        disabled={uploading}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerUpload(task.id);
                                        }}
                                    >
                                        {activeTaskId === task.id && uploading ? <span className="animate-spin text-xs">↻</span> : <Upload className="w-4 h-4" />}
                                    </button>
                                )}
                                </div>
                            </div>
                            {!readOnly && proofName && (
                                <div className="pl-8 pt-1 text-[10px] text-neutral-500 truncate">
                                    Evidence: {proofName}
                                </div>
                            )}
                            
                            {!readOnly && isAdmin && (status === 'pending' || expandedReview === task.id) && (
                                <ReviewPanel 
                                    teamId={team.id}
                                    taskId={task.id} 
                                    currentStatus={status} 
                                    submission={submission}
                                    onReview={onReviewTask} 
                                />
                            )}
                        </div>
                        );
                    })}
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </>
    );
  };

export default MilestoneTracker;
