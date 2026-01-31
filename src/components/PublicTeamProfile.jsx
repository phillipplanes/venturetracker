import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import MilestoneTracker from './MilestoneTracker';
import UpdateFeed from './UpdateFeed';

const PublicTeamProfile = ({ team, updates, phases }) => {
    // Calculate Score
    const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
    const submissions = (team.team_submissions || []).reduce((acc, sub) => {
        acc[sub.task_id] = sub;
        return acc;
    }, {});
    const approvedCount = Object.values(submissions).filter(s => s.status === 'approved').length;
    const score = totalTasks > 0 ? Math.round((approvedCount / totalTasks) * 100) : 0;

    // Extract images from updates for the gallery
    const galleryImages = updates
        .filter(u => u.image_url)
        .map(u => ({ url: u.image_url, date: u.created_at, caption: u.content }));

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header / Hero */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            {team.logo_url && (
                                <img src={team.logo_url} alt={team.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-700 shadow-lg bg-neutral-800" />
                            )}
                            <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">{team.name}</h1>
                            <span className="px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-700/50 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                                Class of 2026
                            </span>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Elevator Pitch</h3>
                            <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl">
                                {team.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">The Team</h3>
                            <div className="flex flex-wrap gap-2">
                                {(team.members || []).map((memberId, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-neutral-800/50 border border-neutral-800 rounded-full pl-1 pr-4 py-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {/* Mock Initials */}
                                            {`M${idx + 1}`}
                                        </div>
                                        <span className="text-sm text-neutral-300">Member {idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Score Card */}
                    <div className="flex flex-col items-center justify-center bg-neutral-950/50 border border-neutral-800 rounded-xl p-6 min-w-[200px]">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Circular Progress Mock */}
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-neutral-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-yellow-500" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-white">{score}</span>
                                <span className="text-[10px] text-neutral-500 uppercase">Score</span>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-neutral-400">Completeness</p>
                            <p className="text-xs text-neutral-600">{approvedCount} Milestones Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Gallery & Milestones */}
                <div className="md:col-span-2 space-y-8">
                    {/* Gallery */}
                    {galleryImages.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-yellow-500" />
                                Project Gallery
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {galleryImages.map((img, i) => (
                                    <div key={i} className="group relative aspect-video bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-yellow-600/50 transition">
                                        <img src={img.url} alt="Update" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <p className="text-xs text-white line-clamp-1">{img.caption}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Simplified Milestones */}
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Milestone Progress</h3>
                        <MilestoneTracker 
                            team={team} 
                            phases={phases}
                            readOnly={true} 
                            isAdmin={false}
                        />
                    </div>
                </div>

                {/* Right: Updates Feed */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Latest Updates</h3>
                    <UpdateFeed updates={updates} readOnly={true} />
                </div>
            </div>
        </div>
    );
};

export default PublicTeamProfile;