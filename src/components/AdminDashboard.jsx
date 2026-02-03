import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Shield, X, Check } from 'lucide-react';
import TeamLogo from './TeamLogo';
import TeamEditModal from './TeamEditModal';
import UserCreateModal from './UserCreateModal';

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

const AdminDashboard = ({ supabase, teams = [], admins = [], profiles = [], settings, cohortPhasesById = {}, onUpdateSettings, onAddAdmin, onRemoveAdmin, onUpdateProfile, onViewTeam, onDeleteTeam, onCreateTeam, onUpdateTeam, onAssignCohort, onCreateUser, onDeleteUser, onRefreshCohorts, teamTagsByTeam = {}, permissions = {}, uploading }) => {
    const [tab, setTab] = useState('overview');
    const [bannerMsg, setBannerMsg] = useState(settings?.banner_message || '');
    const [pitchDate, setPitchDate] = useState(settings?.pitch_date || '');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [teamToDelete, setTeamToDelete] = useState(null);
    const [confirmName, setConfirmName] = useState('');
    const [milestones, setMilestones] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [newCohortName, setNewCohortName] = useState('');
    const [newCohortStatus, setNewCohortStatus] = useState('active');
    const [newCohortStart, setNewCohortStart] = useState('');
    const [newCohortEnd, setNewCohortEnd] = useState('');
    const [newCohortPitchDate, setNewCohortPitchDate] = useState('');
    const [selectedMilestoneCohort, setSelectedMilestoneCohort] = useState('');
    const [copying, setCopying] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [bannerStatus, setBannerStatus] = useState({});
    const [dateStatus, setDateStatus] = useState({});
    const [teamSearch, setTeamSearch] = useState('');
    const [teamSort, setTeamSort] = useState('newest');
    const [teamCohortFilter, setTeamCohortFilter] = useState('');
    const [dragTask, setDragTask] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [teamUpdatesById, setTeamUpdatesById] = useState({});
    const [teamDetailsOpen, setTeamDetailsOpen] = useState({});
    const adminCardClass = "w-full";
    const adminFormClass = "w-full max-w-4xl mx-auto";
    const canEdit = permissions.canEdit !== false;
    const canDelete = permissions.canDelete !== false;
    const canManageRoles = permissions.canManageRoles !== false;
    const canApprove = permissions.canApprove !== false;

    const toLocalInputValue = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const fetchMilestonesForCohort = async (cohortId) => {
        if (!cohortId) {
            setMilestones([]);
            return;
        }
        const { data: phaseData, error } = await supabase
            .from('milestone_phases')
            .select('*, tasks:milestone_tasks(*)')
            .eq('cohort_id', cohortId)
            .order('order');

        if (error) {
            console.error("Error fetching milestones for admin:", error);
            setMilestones([]);
        } else {
            const sortedPhases = (phaseData || []).map(phase => ({ ...phase, tasks: (phase.tasks || []).sort((a, b) => a.order - b.order) }));
            setMilestones(sortedPhases);
        }
    };

    useEffect(() => {
        if (settings) {
            setBannerMsg(settings.banner_message || '');
            setPitchDate(settings.pitch_date || '');
            // Milestones are now fetched separately
        }
    }, [settings]);

    useEffect(() => {
        // Fetch cohorts when the component mounts or tab is switched to cohorts
        if (tab === 'teams' || tab === 'cohorts' || tab === 'milestones') {
            fetchCohorts();
        }
    }, [tab, supabase]);

    useEffect(() => {
        if (tab === 'teams' || tab === 'overview') {
            fetchTeamUpdates();
        }
    }, [tab, teams.length, supabase]);

    useEffect(() => {
        if (tab === 'users') {
            fetchJoinRequests();
            fetchCohorts();
        }
    }, [tab, supabase]);

    useEffect(() => {
        fetchMilestonesForCohort(selectedMilestoneCohort);
    }, [selectedMilestoneCohort, supabase]);

    const saveSettings = () => {
        onUpdateSettings({ id: settings?.id, banner_message: bannerMsg, pitch_date: pitchDate });
    };

    const handleMilestoneChange = (phaseIndex, taskIndex, field, value) => {
        const newMilestones = [...milestones];
        let itemToUpdate;
        if (taskIndex === null) {
            itemToUpdate = newMilestones[phaseIndex];
            itemToUpdate[field] = value;
        } else {
            itemToUpdate = newMilestones[phaseIndex].tasks[taskIndex];
            itemToUpdate[field] = value;
        }
        setMilestones(newMilestones);
    };

    const handleMilestoneBlur = async (phaseIndex, taskIndex) => {
        const newMilestones = [...milestones];
        if (taskIndex === null) {
            const phase = newMilestones[phaseIndex];
            await supabase.from('milestone_phases').update({ title: phase.title }).eq('id', phase.id);
        } else {
            const task = newMilestones[phaseIndex].tasks[taskIndex];
            await supabase.from('milestone_tasks').update({ label: task.label }).eq('id', task.id);
        }
        // No need to set state, it's already updated. 
        // We could add a "saving..." indicator here in the future.
    };

    const persistTaskOrder = async (phaseIndex, tasks) => {
        if (!tasks || tasks.length === 0) return;
        try {
            await Promise.all(
                tasks.map((task, index) =>
                    supabase
                        .from('milestone_tasks')
                        .update({ order: index })
                        .eq('id', task.id)
                )
            );
            const next = [...milestones];
            next[phaseIndex].tasks = tasks;
            setMilestones(next);
        } catch (error) {
            console.error('Failed to update task order:', error);
        }
    };

    const handleTaskDrop = async (phaseIndex, targetIndex) => {
        if (!dragTask || dragTask.phaseIndex !== phaseIndex) return;
        const sourceIndex = dragTask.taskIndex;
        if (sourceIndex === targetIndex) return;
        const next = [...milestones];
        const tasks = [...next[phaseIndex].tasks];
        const [moved] = tasks.splice(sourceIndex, 1);
        tasks.splice(targetIndex, 0, moved);
        next[phaseIndex].tasks = tasks;
        setMilestones(next);
        setDragTask(null);
        await persistTaskOrder(phaseIndex, tasks);
    };

    const addPhase = async () => {
        if (!selectedMilestoneCohort) return;
        const cohortId = selectedMilestoneCohort;

        const { data } = await supabase.from('milestone_phases').insert([{ title: 'New Phase', order: milestones.length, cohort_id: cohortId }]).select();
        if (data) setMilestones([...milestones, { ...data[0], tasks: [] }]);
    };

    const addTask = async (phaseIndex) => {
        const phase = milestones[phaseIndex];
        const { data } = await supabase.from('milestone_tasks').insert([{ label: 'New Task', order: phase.tasks.length, phase_id: phase.id }]).select();
        if (data) {
            const newMilestones = [...milestones];
            newMilestones[phaseIndex].tasks.push(data[0]);
            setMilestones(newMilestones);
        }
    };

    const removePhase = async (phaseIndex) => {
        const phase = milestones[phaseIndex];
        await supabase.from('milestone_phases').delete().eq('id', phase.id);
        const newMilestones = milestones.filter((_, i) => i !== phaseIndex);
        setMilestones(newMilestones);
    };

    const removeTask = async (phaseIndex, taskIndex) => {
        const task = milestones[phaseIndex].tasks[taskIndex];
        await supabase.from('milestone_tasks').delete().eq('id', task.id);
        
        const newMilestones = [...milestones];
        newMilestones[phaseIndex].tasks = newMilestones[phaseIndex].tasks.filter((_, i) => i !== taskIndex);
        setMilestones(newMilestones);
    };

    const fetchCohorts = async () => {
        const { data } = await supabase.from('cohorts').select('*').order('created_at', { ascending: false });
        if (data) setCohorts(data);
    };

    const fetchJoinRequests = async () => {
        const { data, error } = await supabase
            .from('cohort_join_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching join requests:', error);
        } else {
            setJoinRequests(data || []);
        }
    };

    const fetchTeamUpdates = async () => {
        const { data, error } = await supabase
            .from('updates')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching updates for admin:', error);
            return;
        }
        const grouped = {};
        (data || []).forEach((u) => {
            if (!grouped[u.team_id]) grouped[u.team_id] = [];
            grouped[u.team_id].push(u);
        });
        setTeamUpdatesById(grouped);
    };

    const handleApproveJoinRequest = async (request) => {
        if (!canApprove) return;
        if (!request) return;
        const { error } = await supabase
            .from('cohort_join_requests')
            .update({ status: 'approved' })
            .eq('id', request.id);
        if (error) {
            alert('Failed to approve request: ' + error.message);
            return;
        }
        await supabase
            .from('profiles')
            .update({ cohort_id: request.cohort_id })
            .eq('id', request.user_id);
        const cohortName = cohorts.find(c => c.id === request.cohort_id)?.name || '';
        if (request.email) {
            try {
                await supabase.functions.invoke('send-cohort-email', {
                    body: {
                        type: 'approved',
                        email: request.email,
                        cohortName
                    }
                });
            } catch (err) {
                console.warn('Failed to send approval email:', err);
            }
        }
        fetchJoinRequests();
    };

    const handleRejectJoinRequest = async (request) => {
        if (!canApprove) return;
        if (!request) return;
        const { error } = await supabase
            .from('cohort_join_requests')
            .update({ status: 'rejected' })
            .eq('id', request.id);
        if (error) {
            alert('Failed to reject request: ' + error.message);
            return;
        }
        const cohortName = cohorts.find(c => c.id === request.cohort_id)?.name || '';
        if (request.email) {
            try {
                await supabase.functions.invoke('send-cohort-email', {
                    body: {
                        type: 'rejected',
                        email: request.email,
                        cohortName
                    }
                });
            } catch (err) {
                console.warn('Failed to send rejection email:', err);
            }
        }
        fetchJoinRequests();
    };

    const handleCreateCohort = async () => {
        if (!newCohortName.trim()) return;
        const { error } = await supabase.from('cohorts').insert([{
            name: newCohortName,
            status: newCohortStatus,
            start_date: newCohortStart || null,
            end_date: newCohortEnd || null,
            pitch_date: newCohortPitchDate || null
        }]);
        if (!error) {
            setNewCohortName('');
            setNewCohortStatus('active');
            setNewCohortStart('');
            setNewCohortEnd('');
            setNewCohortPitchDate('');
            fetchCohorts();
        } else {
            alert("Failed to create cohort: " + error.message);
        }
    };

    const handleUpdateCohortStatus = async (cohortId, status) => {
        const { error } = await supabase.from('cohorts').update({ status }).eq('id', cohortId);
        if (error) {
            alert("Failed to update cohort status: " + error.message);
        } else {
            fetchCohorts();
        }
    };

    const handleCopyCohort = async (sourceCohortId) => {
        const sourceCohort = cohorts.find(c => c.id === sourceCohortId);
        if (!sourceCohort) return;

        const newName = `Copy of ${sourceCohort.name}`;
        setCopying(true);

        try {
            // 1. Create new cohort
            const { data: newCohortData, error: cohortError } = await supabase.from('cohorts').insert([{ name: newName, status: sourceCohort.status || 'active' }]).select().single();
            if (cohortError) throw cohortError;

            // 2. Fetch phases and tasks from source cohort
            const { data: sourcePhases, error: phasesError } = await supabase.from('milestone_phases').select('*, tasks:milestone_tasks(*)').eq('cohort_id', sourceCohortId);
            if (phasesError) throw phasesError;

            // 3. Create new phases and tasks
            for (const phase of sourcePhases) {
                const { tasks, id, created_at, ...phaseDetails } = phase;
                const { data: newPhaseData, error: newPhaseError } = await supabase.from('milestone_phases').insert([{ ...phaseDetails, cohort_id: newCohortData.id }]).select().single();
                if (newPhaseError) throw newPhaseError;

                if (tasks && tasks.length > 0) {
                    const newTasks = tasks.map(({ id, created_at, ...t }) => ({ ...t, phase_id: newPhaseData.id }));
                    const { error: newTasksError } = await supabase.from('milestone_tasks').insert(newTasks);
                    if (newTasksError) throw newTasksError;
                }
            }
            fetchCohorts(); // Refresh list
        } catch (error) {
            alert("Failed to copy cohort: " + error.message);
        } finally {
            setCopying(false);
        }
    };

    const handleCopyMilestones = async (sourceCohortId) => {
        if (!sourceCohortId || !selectedMilestoneCohort) return;
        setCopying(true);
        try {
            // 1. Fetch phases and tasks from source cohort
            const { data: sourcePhases, error: phasesError } = await supabase.from('milestone_phases').select('*, tasks:milestone_tasks(*)').eq('cohort_id', sourceCohortId);
            if (phasesError) throw phasesError;

            // 2. Create new phases and tasks for the target cohort
            for (const phase of sourcePhases) {
                const { tasks, id, created_at, ...phaseDetails } = phase;
                const { data: newPhaseData, error: newPhaseError } = await supabase.from('milestone_phases').insert([{ ...phaseDetails, cohort_id: selectedMilestoneCohort }]).select().single();
                if (newPhaseError) throw newPhaseError;

                if (tasks && tasks.length > 0) {
                    const newTasks = tasks.map(({ id, created_at, ...t }) => ({ ...t, phase_id: newPhaseData.id }));
                    const { error: newTasksError } = await supabase.from('milestone_tasks').insert(newTasks);
                    if (newTasksError) throw newTasksError;
                }
            }
            await fetchMilestonesForCohort(selectedMilestoneCohort);
        } catch (error) {
            alert("Failed to copy milestones: " + error.message);
        } finally {
            setCopying(false);
        }
    };

    const handleDeleteCohort = async (cohortId) => {
        const { error } = await supabase.from('cohorts').delete().eq('id', cohortId);
        if (error) {
            alert('Failed to delete cohort: ' + error.message);
        } else {
            // Also delete associated phases and tasks (handled by DB cascade)
            // Refresh the cohort list
            fetchCohorts();
        }
    };

    const filteredProfiles = profiles.filter(p => 
        p.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const tabs = ['overview', 'teams', 'users', 'cohorts', 'milestones', 'settings'];

    return (
        <div className="px-4 md:px-8 py-6 w-full overflow-x-hidden">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Shield className="w-8 h-8 text-yellow-500" />
                Admin Dashboard
            </h1>

            {/* Mobile tab selector */}
            <div className="md:hidden mb-6">
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Section</label>
                <select
                    value={tab}
                    onChange={(e) => setTab(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white outline-none focus:border-yellow-500"
                >
                    {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="hidden md:flex gap-4 border-b border-neutral-800 mb-8 overflow-x-auto">
                {tabs.map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${tab === t ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-neutral-500 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className="space-y-6 w-full">
                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                        <div className="bg-neutral-900 p-4 md:p-6 rounded-xl border border-neutral-800">
                            <h3 className="text-neutral-400 text-[10px] md:text-xs uppercase font-bold mb-2">
                                <span className="md:hidden">Teams</span>
                                <span className="hidden md:inline">Total Teams</span>
                            </h3>
                            <p className="text-2xl md:text-4xl font-bold text-white">{teams.length}</p>
                        </div>
                        <div className="bg-neutral-900 p-4 md:p-6 rounded-xl border border-neutral-800">
                            <h3 className="text-neutral-400 text-[10px] md:text-xs uppercase font-bold mb-2">
                                <span className="md:hidden">Students</span>
                                <span className="hidden md:inline">Total Students</span>
                            </h3>
                            <p className="text-2xl md:text-4xl font-bold text-white">{teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}</p>
                        </div>
                        <div className="bg-neutral-900 p-4 md:p-6 rounded-xl border border-neutral-800">
                            <h3 className="text-neutral-400 text-[10px] md:text-xs uppercase font-bold mb-2">
                                <span className="md:hidden">Pending</span>
                                <span className="hidden md:inline">Pending Reviews</span>
                            </h3>
                            <p className="text-2xl md:text-4xl font-bold text-white">
                                {teams.reduce((acc, t) => {
                                    const subs = (t.team_submissions || []);
                                    return acc + subs.filter(s => s.status === 'pending').length;
                                }, 0)}
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <h3 className="text-base font-bold text-white mb-3">Progress Overview</h3>
                            {(() => {
                                const buckets = { '0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0 };
                                teams.forEach(team => {
                                    const phases = cohortPhasesById[team.cohort_id] || [];
                                    const taskIdSet = new Set(phases.flatMap(p => (p.tasks || []).map(t => t.id)));
                                    const totalTasks = taskIdSet.size;
                                    const submissions = (team.team_submissions || []).reduce((acc, sub) => {
                                        acc[sub.task_id] = sub;
                                        return acc;
                                    }, {});
                                    const approvedCount = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'approved').length;
                                    const progress = totalTasks > 0 ? Math.round((approvedCount / totalTasks) * 100) : 0;
                                    if (progress <= 25) buckets['0-25%'] += 1;
                                    else if (progress <= 50) buckets['26-50%'] += 1;
                                    else if (progress <= 75) buckets['51-75%'] += 1;
                                    else buckets['76-100%'] += 1;
                                });
                                return (
                                    <div className="space-y-2">
                                        {Object.entries(buckets).map(([label, count]) => (
                                            <div key={label} className="flex items-center justify-between text-sm text-neutral-400">
                                                <span>{label}</span>
                                                <span className="text-yellow-400 font-bold">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <h3 className="text-base font-bold text-white mb-3">Teams Needing Attention</h3>
                            {(() => {
                                const staleCutoff = Date.now() - 1000 * 60 * 60 * 24 * 14;
                                const staleTeams = teams.filter(team => {
                                    const updates = teamUpdatesById[team.id] || [];
                                    const latest = updates[0]?.created_at ? new Date(updates[0].created_at).getTime() : 0;
                                    return updates.length === 0 || latest < staleCutoff;
                                }).slice(0, 6);
                                return staleTeams.length === 0 ? (
                                    <p className="text-sm text-neutral-500">No stale updates.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {staleTeams.map(team => (
                                            <div key={team.id} className="flex items-center justify-between text-sm text-neutral-400">
                                                <span className="truncate">{team.name}</span>
                                                <span className="text-red-400">No recent updates</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <h3 className="text-base font-bold text-white mb-3">Pending Reviews</h3>
                            {(() => {
                                const pending = teams.flatMap(team => (team.team_submissions || [])
                                    .filter(s => s.status === 'pending')
                                    .map(s => ({ team, submission: s }))
                                ).slice(0, 6);
                                return pending.length === 0 ? (
                                    <p className="text-sm text-neutral-500">No pending reviews.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {pending.map((item, idx) => (
                                            <button
                                                key={`${item.team.id}-${idx}`}
                                                onClick={() => onViewTeam(item.team)}
                                                className="w-full flex items-center justify-between text-sm text-neutral-400 hover:text-white"
                                            >
                                                <span className="truncate">{item.team.name}</span>
                                                <span className="text-yellow-400">Pending</span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'teams' && (
                <div className="space-y-4 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <input
                                value={teamSearch}
                                onChange={(e) => setTeamSearch(e.target.value)}
                                placeholder="Search teams..."
                                className="w-full sm:w-64 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm focus:border-yellow-500 outline-none"
                            />
                            <select
                                value={teamCohortFilter}
                                onChange={(e) => setTeamCohortFilter(e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                            >
                                <option value="">All Cohorts</option>
                                {cohorts.map((cohort) => (
                                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                                ))}
                            </select>
                            <select
                                value={teamSort}
                                onChange={(e) => setTeamSort(e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="name-asc">Name A–Z</option>
                                <option value="name-desc">Name Z–A</option>
                                <option value="members-desc">Most Members</option>
                            </select>
                        </div>
                            <button onClick={() => setEditingTeam({ name: '', description: '' })} disabled={!canEdit} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 text-sm flex items-center gap-2 disabled:opacity-50">
                                <Plus className="w-4 h-4" />
                                Create New Team
                            </button>
                    </div>
                    {(() => {
                        const filtered = teams.filter(t => {
                            const q = teamSearch.trim().toLowerCase();
                            if (teamCohortFilter && t.cohort_id !== teamCohortFilter) {
                                return false;
                            }
                            if (!q) return true;
                            return (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
                        });
                        const sorted = [...filtered].sort((a, b) => {
                            if (teamSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
                            if (teamSort === 'name-desc') return (b.name || '').localeCompare(a.name || '');
                            if (teamSort === 'members-desc') return (b.members?.length || 0) - (a.members?.length || 0);
                            if (teamSort === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
                            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                        });
                        return (
                            <div className="space-y-4">
                                {sorted.map(team => {
                                    const memberProfiles = (team.members || [])
                                        .map(id => profiles.find(p => p.id === id))
                                        .filter(Boolean);
                                    const updatesForTeam = teamUpdatesById[team.id] || [];
                                    const feedbackForTeam = team.feedback || [];
                                    const isExpanded = Boolean(teamDetailsOpen[team.id]);
                                    return (
                                        <div key={team.id} className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex flex-col gap-4">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                                <div className="flex items-start gap-4 min-w-0">
                                                    <TeamLogo url={team.logo_display_url || team.logo_url} name={team.name} fit="contain" className="w-12 h-12 rounded-lg bg-neutral-950 border border-neutral-800" />
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-white">{team.name}</h4>
                                                    <p className="text-sm text-neutral-300 line-clamp-2">{team.description || 'No description'}</p>
                                                    {(teamTagsByTeam[team.id] || []).length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {teamTagsByTeam[team.id].map((tag, idx) => (
                                                                <span key={`${team.id}-tag-${idx}`} className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-yellow-300 border border-neutral-700">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {memberProfiles.length > 0 ? memberProfiles.map(m => (
                                                            <span key={m.id} className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-300 border border-neutral-700">
                                                                {m.email || m.full_name || m.id}
                                                                </span>
                                                            )) : (
                                                                <span className="text-neutral-600 italic text-xs">No members</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start md:items-end gap-2">
                                                    <select
                                                        value={team.cohort_id || ''}
                                                        onChange={(e) => onAssignCohort(team.id, e.target.value)}
                                                        disabled={!canEdit}
                                                        className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-md px-2 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                                    >
                                                        <option value="">Assign Cohort...</option>
                                                        {cohorts.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button onClick={() => onViewTeam(team)} className="text-sm bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-bold border border-yellow-500/50 transition">
                                                            View
                                                        </button>
                                                        <button onClick={() => setEditingTeam(team)} disabled={!canEdit} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-md border border-neutral-700 transition flex items-center gap-1 disabled:opacity-50">
                                                            <Edit2 className="w-3 h-3" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setTeamDetailsOpen(prev => ({ ...prev, [team.id]: !prev[team.id] }))}
                                                            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-md border border-neutral-700 transition"
                                                        >
                                                            {isExpanded ? 'Hide Updates' : 'Show Updates'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setTeamToDelete(team)} 
                                                            disabled={!canDelete}
                                                            className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-2 rounded-md border border-red-900/30 transition flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="grid md:grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-xs uppercase font-bold text-neutral-500">Weekly Updates</h5>
                                                            <span className="text-[10px] text-neutral-500">{updatesForTeam.length} total</span>
                                                        </div>
                                                        {updatesForTeam.length === 0 ? (
                                                            <p className="text-xs text-neutral-600 italic">No updates yet.</p>
                                                        ) : (
                                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
                                                                {updatesForTeam.map(update => (
                                                                    <div key={update.id} className="bg-neutral-950 border border-neutral-800 rounded-md p-3">
                                                                        <p className="text-sm text-neutral-200">{update.content || 'No content'}</p>
                                                                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2">
                                                                            <span>{update.author_email || update.author_id || 'Unknown'}</span>
                                                                            <span>{update.created_at ? new Date(update.created_at).toLocaleDateString() : ''}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-xs uppercase font-bold text-neutral-500">Professor Feedback</h5>
                                                            <span className="text-[10px] text-neutral-500">{feedbackForTeam.length} total</span>
                                                        </div>
                                                        {feedbackForTeam.length === 0 ? (
                                                            <p className="text-xs text-neutral-600 italic">No feedback yet.</p>
                                                        ) : (
                                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
                                                                {feedbackForTeam.map((item, idx) => (
                                                                    <div key={`${team.id}-feedback-${idx}`} className="bg-neutral-950 border border-neutral-800 rounded-md p-3">
                                                                        <p className="text-sm text-neutral-200">{item.text || item.content || item.note || 'Feedback note'}</p>
                                                                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2">
                                                                            <span>{item.author_email || item.author || 'Instructor'}</span>
                                                                            <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {sorted.length === 0 && (
                                    <div className="text-center text-neutral-600 italic">No teams found.</div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {tab === 'cohorts' && (
                <div className="space-y-8 w-full flex flex-col md:items-center">
                    <div className={`bg-neutral-900 p-6 rounded-xl border border-neutral-800 ${adminCardClass}`}>
                        <h3 className="text-lg font-bold text-white mb-4">Create New Cohort</h3>
                        <div className={adminFormClass}>
                            <div className="grid md:grid-cols-7 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] text-neutral-500 mb-1">Cohort Name</label>
                                    <input 
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white outline-none focus:border-yellow-500"
                                        placeholder="e.g., Fall 2024"
                                        value={newCohortName}
                                        onChange={(e) => setNewCohortName(e.target.value)}
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] text-neutral-500 mb-1">Status</label>
                                    <select
                                        value={newCohortStatus}
                                        onChange={(e) => setNewCohortStatus(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                    >
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] text-neutral-500 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={newCohortStart}
                                        onChange={(e) => setNewCohortStart(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] text-neutral-500 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={newCohortEnd}
                                        onChange={(e) => setNewCohortEnd(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] text-neutral-500 mb-1">Pitch Date</label>
                                    <input
                                        type="date"
                                        value={newCohortPitchDate}
                                        onChange={(e) => setNewCohortPitchDate(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex items-end">
                                            <button onClick={handleCreateCohort} disabled={!newCohortName.trim() || uploading || !canEdit} className="w-full bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                                                Create
                                            </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-neutral-900 p-6 rounded-xl border border-neutral-800 ${adminCardClass}`}>
                        <h3 className="text-lg font-bold text-white mb-4">Existing Cohorts</h3>
                        <div className="space-y-4 pr-2">
                            {cohorts.length === 0 && <p className="text-sm text-neutral-500 italic">No cohorts created yet.</p>}
                            {cohorts.map(cohort => {
                                const teamsInCohort = teams.filter(t => t.cohort_id === cohort.id);
                                const canDelete = teamsInCohort.length === 0;

                                return (
                                    <div key={cohort.id} className="flex flex-col gap-4 bg-neutral-950/70 p-4 md:p-5 rounded-xl border border-neutral-800 shadow-sm">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                          <div>
                                            <p className="text-yellow-500 font-semibold text-lg">{cohort.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-neutral-500">{teamsInCohort.length} teams assigned</span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                                                    cohort.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-700/50' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                                }`}>
                                                    {cohort.status || 'active'}
                                                </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <select
                                                value={cohort.status || 'active'}
                                                onChange={(e) => handleUpdateCohortStatus(cohort.id, e.target.value)}
                                                disabled={!canEdit}
                                                className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-md px-2 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                            >
                                                <option value="active">Active</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to duplicate the '${cohort.name}' cohort and all its milestones?`)) {
                                                        handleCopyCohort(cohort.id);
                                                    }
                                                }}
                                                disabled={copying || !canEdit}
                                                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-md font-medium border border-neutral-700 disabled:opacity-50"
                                            >
                                                {copying ? 'Copying...' : 'Duplicate'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Delete cohort '${cohort.name}'? This cannot be undone.`)) {
                                                        handleDeleteCohort(cohort.id);
                                                    }
                                                }}
                                                disabled={!canDelete}
                                                className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded-md font-medium border border-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-900/20"
                                                title={canDelete ? 'Delete cohort' : 'Cannot delete cohort with assigned teams'}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="h-px bg-neutral-800/80" />
                                        <div className="mt-1">
                                          <label className="block text-[10px] text-neutral-500 uppercase mb-1">Cohort Banner Message (optional)</label>
                                          <div className="flex flex-col md:flex-row gap-2">
                                            <input
                                              value={cohort.banner_message || ''}
                                              onChange={(e) => {
                                                const next = e.target.value;
                                                setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, banner_message: next } : c));
                                                setBannerStatus(prev => ({ ...prev, [cohort.id]: '' }));
                                              }}
                                              disabled={!canEdit}
                                              placeholder="Overrides global banner for teams in this cohort"
                                              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500 disabled:opacity-50"
                                            />
                                            <button
                                              onClick={async () => {
                                                const next = (cohort.banner_message || '').trim();
                                                setBannerStatus(prev => ({ ...prev, [cohort.id]: 'saving' }));
                                                const { error } = await supabase.from('cohorts').update({ banner_message: next || null }).eq('id', cohort.id);
                                                if (error) {
                                                  setBannerStatus(prev => ({ ...prev, [cohort.id]: 'error' }));
                                                } else {
                                                  setBannerStatus(prev => ({ ...prev, [cohort.id]: 'saved' }));
                                                  if (onRefreshCohorts) onRefreshCohorts();
                                                }
                                              }}
                                              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3 py-2 rounded-md border border-neutral-700"
                                              disabled={!canEdit}
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={async () => {
                                                setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, banner_message: '' } : c));
                                                setBannerStatus(prev => ({ ...prev, [cohort.id]: 'saving' }));
                                                const { error } = await supabase.from('cohorts').update({ banner_message: null }).eq('id', cohort.id);
                                                if (error) {
                                                  setBannerStatus(prev => ({ ...prev, [cohort.id]: 'error' }));
                                                } else {
                                                  setBannerStatus(prev => ({ ...prev, [cohort.id]: 'saved' }));
                                                  if (onRefreshCohorts) onRefreshCohorts();
                                                }
                                              }}
                                              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs px-3 py-2 rounded-md border border-neutral-700"
                                              disabled={!canEdit}
                                            >
                                              Clear
                                            </button>
                                          </div>
                                          {bannerStatus[cohort.id] === 'saved' && (
                                            <p className="text-[10px] text-green-400 mt-1">Saved</p>
                                          )}
                                          {bannerStatus[cohort.id] === 'error' && (
                                            <p className="text-[10px] text-red-400 mt-1">Save failed</p>
                                          )}
                                        </div>
                                        <div className="mt-2">
                                          <label className="block text-[10px] text-neutral-500 uppercase mb-2">Cohort Dates</label>
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                            <div>
                                              <label className="block text-[10px] text-neutral-500 mb-1">Start Date</label>
                                              <input
                                                type="date"
                                                value={cohort.start_date || ''}
                                                onChange={(e) => {
                                                  const next = e.target.value;
                                                  setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, start_date: next } : c));
                                                  setDateStatus(prev => ({ ...prev, [cohort.id]: '' }));
                                                }}
                                                disabled={!canEdit}
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500 disabled:opacity-50"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] text-neutral-500 mb-1">End Date</label>
                                              <input
                                                type="date"
                                                value={cohort.end_date || ''}
                                                onChange={(e) => {
                                                  const next = e.target.value;
                                                  setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, end_date: next } : c));
                                                  setDateStatus(prev => ({ ...prev, [cohort.id]: '' }));
                                                }}
                                                disabled={!canEdit}
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500 disabled:opacity-50"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] text-neutral-500 mb-1">Pitch Date</label>
                                              <input
                                                type="date"
                                                value={cohort.pitch_date || ''}
                                                onChange={(e) => {
                                                  const next = e.target.value;
                                                  setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, pitch_date: next } : c));
                                                  setDateStatus(prev => ({ ...prev, [cohort.id]: '' }));
                                                }}
                                                disabled={!canEdit}
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500 disabled:opacity-50"
                                              />
                                            </div>
                                            <div className="flex items-end">
                                              <button
                                                onClick={async () => {
                                                  setDateStatus(prev => ({ ...prev, [cohort.id]: 'saving' }));
                                                  const { error } = await supabase.from('cohorts').update({
                                                    start_date: cohort.start_date || null,
                                                    end_date: cohort.end_date || null,
                                                    pitch_date: cohort.pitch_date || null
                                                  }).eq('id', cohort.id);
                                                  if (error) {
                                                    setDateStatus(prev => ({ ...prev, [cohort.id]: 'error' }));
                                                  } else {
                                                    setDateStatus(prev => ({ ...prev, [cohort.id]: 'saved' }));
                                                    if (onRefreshCohorts) onRefreshCohorts();
                                                  }
                                                }}
                                                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3 py-2 rounded-md border border-neutral-700"
                                                disabled={!canEdit}
                                              >
                                                Save Dates
                                              </button>
                                            </div>
                                          </div>
                                          {dateStatus[cohort.id] === 'saved' && (
                                            <p className="text-[10px] text-green-400 mt-1">Dates saved</p>
                                          )}
                                          {dateStatus[cohort.id] === 'error' && (
                                            <p className="text-[10px] text-red-400 mt-1">Date save failed</p>
                                          )}
                                        </div>
                                        <div className="mt-3">
                                          <label className="block text-[10px] text-neutral-500 uppercase mb-2">Teams in Cohort</label>
                                          <div className="space-y-2 max-w-md">
                                            {teams.filter(t => t.cohort_id === cohort.id).map(team => {
                                              const phases = cohortPhasesById[cohort.id] || [];
                                              const taskIdSet = new Set(phases.flatMap(p => (p.tasks || []).map(t => t.id)));
                                              const submissions = (team.team_submissions || []).reduce((acc, sub) => {
                                                acc[sub.task_id] = sub;
                                                return acc;
                                              }, {});
                                              const approvedCount = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'approved').length;
                                              const totalTasks = taskIdSet.size;
                                              const progress = totalTasks > 0 ? Math.round((approvedCount / totalTasks) * 100) : 0;

                                              return (
                                                <div key={team.id} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2">
                                                  <span className="text-xs text-neutral-200 truncate">{team.name}</span>
                                                  <span className="text-xs text-yellow-400 font-bold">{progress}%</span>
                                                </div>
                                              );
                                            })}
                                            {teams.filter(t => t.cohort_id === cohort.id).length === 0 && (
                                              <p className="text-xs text-neutral-500 italic">No teams assigned.</p>
                                            )}
                                          </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'users' && (
                <div className="space-y-6 w-full flex flex-col md:items-center">
                    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-5 ${adminCardClass}`}>
                        <div className={adminFormClass}>
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Pending Cohort Requests</h3>
                                    <p className="text-xs text-neutral-500">Approve or reject new student requests.</p>
                                </div>
                                <button
                                    onClick={fetchJoinRequests}
                                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-md border border-neutral-700 transition"
                                >
                                    Refresh
                                </button>
                            </div>
                            <div className="space-y-2">
                                {joinRequests.filter(r => r.status === 'pending').length === 0 && (
                                    <p className="text-xs text-neutral-500 italic">No pending requests.</p>
                                )}
                                {joinRequests.filter(r => r.status === 'pending').map(req => {
                                    const cohort = cohorts.find(c => c.id === req.cohort_id);
                                    return (
                                        <div key={req.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                                            <div>
                                                <p className="text-sm text-white font-semibold">{req.email || req.user_id}</p>
                                                <p className="text-xs text-neutral-500">
                                                    Cohort: <span className="text-yellow-500 font-semibold">{cohort?.name || req.cohort_id}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApproveJoinRequest(req)}
                                                    disabled={!canApprove}
                                                    className="text-xs bg-green-800 hover:bg-green-700 text-green-100 px-3 py-2 rounded-md border border-green-900/40 transition disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectJoinRequest(req)}
                                                    disabled={!canApprove}
                                                    className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-300 px-3 py-2 rounded-md border border-red-900/30 transition disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">User Directory</h3>
                            <p className="text-sm text-neutral-500">{profiles.length} users</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm focus:border-yellow-500 outline-none w-full sm:w-64"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                                                <button onClick={() => setIsCreatingUser(true)} disabled={!canEdit} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                                    <Plus className="w-4 h-4" /> Create User
                                                </button>
                        </div>
                    </div>
                    
                    {/* Mobile cards */}
                    <div className={`md:hidden space-y-3 ${adminCardClass}`}>
                        {filteredProfiles.map(profile => {
                            const isAdmin = admins.some(a => a.email === profile.email);
                            const userTeams = teams.filter(t => t.members?.includes(profile.id));
                            return (
                                <div key={profile.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-white">{profile.email}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {canManageRoles ? (
                                                    <select
                                                        value={profile.role || 'student'}
                                                        onChange={(e) => onUpdateProfile(profile.id, { role: e.target.value })}
                                                        className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-md px-2 py-1 focus:ring-yellow-500 focus:border-yellow-500"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="mentor">Mentor</option>
                                                        <option value="professor">Professor</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                        profile.role === 'admin' ? 'bg-yellow-900/30 text-yellow-400' :
                                                        profile.role === 'professor' ? 'bg-purple-900/30 text-purple-400' :
                                                        profile.role === 'mentor' ? 'bg-blue-900/30 text-blue-400' :
                                                        'bg-neutral-800 text-neutral-300'
                                                    }`}>{profile.role || 'student'}</span>
                                                )}
                                            </div>
                                        </div>
                                            <button
                                                onClick={() => onDeleteUser && onDeleteUser(profile)}
                                                disabled={!canDelete}
                                                className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-2 rounded-md border border-red-900/30 transition disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-[10px] text-neutral-500 uppercase font-bold mb-2">Teams</p>
                                        <div className="flex flex-wrap gap-1">
                                            {userTeams.length > 0 ? userTeams.map(t => (
                                                <span key={t.id} className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-300 border border-neutral-700">{t.name}</span>
                                            )) : <span className="text-neutral-600 italic text-xs">No Team</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredProfiles.length === 0 && (
                            <div className="p-8 text-center text-neutral-600 italic">No users found.</div>
                        )}
                    </div>

                    {/* Desktop table */}
                    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hidden md:block ${adminCardClass}`}>
                        <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-neutral-950 text-neutral-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Teams</th>
                                    <th className="p-4">Admin</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {filteredProfiles.map(profile => {
                                    const isAdmin = admins.some(a => a.email === profile.email);
                                    const userTeams = teams.filter(t => t.members?.includes(profile.id));
                                    
                                    return (
                                        <tr key={profile.id} className="hover:bg-neutral-800/30 transition">
                                            <td className="p-4 font-medium text-white">{profile.email}</td>
                                            <td className="p-4">
                                                {canManageRoles ? (
                                                    <select
                                                        value={profile.role || 'student'}
                                                        onChange={(e) => onUpdateProfile(profile.id, { role: e.target.value })}
                                                        className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-md px-2 py-1 focus:ring-yellow-500 focus:border-yellow-500"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="mentor">Mentor</option>
                                                        <option value="professor">Professor</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                        profile.role === 'admin' ? 'bg-yellow-900/30 text-yellow-400' :
                                                        profile.role === 'professor' ? 'bg-purple-900/30 text-purple-400' :
                                                        profile.role === 'mentor' ? 'bg-blue-900/30 text-blue-400' :
                                                        'bg-neutral-800 text-neutral-300'
                                                    }`}>{profile.role || 'student'}</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {userTeams.length > 0 ? userTeams.map(t => (
                                                        <span key={t.id} className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-300 border border-neutral-700">{t.name}</span>
                                                    )) : <span className="text-neutral-600 italic text-xs">No Team</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isAdmin} 
                                                    onChange={(e) => e.target.checked ? onAddAdmin(profile.email) : onRemoveAdmin(admins.find(a => a.email === profile.email)?.id)}
                                                    disabled={!canManageRoles}
                                                    className="rounded bg-neutral-800 border-neutral-700 text-yellow-600 focus:ring-yellow-600 disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => onDeleteUser && onDeleteUser(profile)}
                                                    disabled={!canDelete}
                                                    className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-2 rounded-md border border-red-900/30 transition disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredProfiles.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-neutral-600 italic">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'milestones' && (
                <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 w-full">
                    <h3 className="text-xl font-bold text-white mb-2">Edit Milestones</h3>
                    <p className="text-sm text-neutral-400 mb-6">Select a cohort to configure its venture roadmap.</p>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Select Cohort</label>
                        <div className="w-full max-w-xl">
                            <select
                                value={selectedMilestoneCohort}
                                onChange={(e) => setSelectedMilestoneCohort(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white outline-none focus:border-yellow-500"
                            >
                                <option value="">-- Choose a cohort --</option>
                                {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {selectedMilestoneCohort && (
                        milestones.length > 0 ? (
                            <div className="space-y-4 animate-fade-in">
                                {milestones.map((phase, phaseIndex) => (
                                    <div key={phase.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2 group">
                                            <input 
                                                className="text-lg font-bold text-white bg-transparent outline-none w-full"
                                                value={phase.title}
                                                onChange={(e) => canEdit && handleMilestoneChange(phaseIndex, null, 'title', e.target.value)}
                                                onBlur={() => canEdit && handleMilestoneBlur(phaseIndex, null)}
                                                readOnly={!canEdit}
                                            />
                                            {canEdit && (
                                                <button onClick={() => removePhase(phaseIndex)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            {phase.tasks.map((task, taskIndex) => (
                                                <div
                                                    key={task.id}
                                                    className={`flex items-center gap-2 ${dragTask && dragTask.phaseIndex === phaseIndex && dragTask.taskIndex === taskIndex ? 'opacity-60' : ''}`}
                                                    draggable={canEdit}
                                                    onDragStart={() => canEdit && setDragTask({ phaseIndex, taskIndex })}
                                                    onDragEnd={() => canEdit && setDragTask(null)}
                                                    onDragOver={(e) => canEdit && e.preventDefault()}
                                                    onDrop={() => canEdit && handleTaskDrop(phaseIndex, taskIndex)}
                                                >
                                                    <div className="text-neutral-600 cursor-grab select-none px-1" title="Drag to reorder">⋮⋮</div>
                                                    <input 
                                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white outline-none focus:border-yellow-500"
                                                        value={task.label}
                                                        onChange={(e) => canEdit && handleMilestoneChange(phaseIndex, taskIndex, 'label', e.target.value)}
                                                        onBlur={() => canEdit && handleMilestoneBlur(phaseIndex, taskIndex)}
                                                        readOnly={!canEdit}
                                                    />
                                                    {canEdit && (
                                                        <button onClick={() => removeTask(phaseIndex, taskIndex)} className="text-neutral-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                            ))}
                                            {canEdit && (
                                                <button onClick={() => addTask(phaseIndex)} className="text-sm text-yellow-500 hover:text-yellow-400 mt-2">+ Add Task</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {canEdit && (
                                    <button onClick={addPhase} className="text-sm text-green-500 hover:text-green-400 mt-4">+ Add Phase</button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center bg-neutral-950 border-2 border-dashed border-neutral-800 p-8 rounded-lg animate-fade-in">
                                <h4 className="text-lg font-bold text-white">This cohort has no milestones.</h4>
                                <p className="text-neutral-400 mb-6">Get started by creating new phases or copying from another cohort.</p>
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={addPhase} disabled={!canEdit} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">Create First Phase</button>
                                    <span className="text-neutral-600">or</span>
                                    <select onChange={(e) => handleCopyMilestones(e.target.value)} disabled={copying || !canEdit} className="bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50">
                                        <option value="">{copying ? 'Copying...' : 'Copy from...'}</option>
                                        {cohorts.filter(c => c.id !== selectedMilestoneCohort).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {tab === 'settings' && (
                <div className="w-full flex flex-col md:items-center">
                  <div className={`bg-neutral-900 p-6 md:p-8 rounded-xl border border-neutral-800 ${adminCardClass}`}>
                    <h3 className="text-xl font-bold text-white mb-6">Global Settings</h3>
                    <div className={adminFormClass}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Banner Message</label>
                            <input className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none disabled:opacity-50" value={bannerMsg} onChange={e => setBannerMsg(e.target.value)} disabled={!canEdit} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Pitch Date</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                                value={toLocalInputValue(pitchDate)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPitchDate(value ? new Date(value).toISOString() : '');
                                }}
                                disabled={!canEdit}
                            />
                        </div>
                        <button onClick={saveSettings} disabled={uploading || !canEdit} className="bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">{uploading ? 'Saving...' : 'Save Settings'}</button>
                        </div>
                    </div>
                  </div>
                </div>
            )}

            {editingTeam && (
                <TeamEditModal
                    team={editingTeam}
                    uploading={uploading}
                    onCancel={() => setEditingTeam(null)}
                    onSave={(teamData) => {
                        if (teamData.id) {
                            onUpdateTeam(teamData);
                        } else {
                            onCreateTeam(teamData);
                        }
                        setEditingTeam(null);
                    }}
                />
            )}

            {isCreatingUser && (
                <UserCreateModal 
                    uploading={uploading}
                    onCancel={() => setIsCreatingUser(false)}
                    onSave={(userData) => {
                        onCreateUser(userData);
                        setIsCreatingUser(false);
                    }}
                />
            )}

            {teamToDelete && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Delete Team
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            Are you sure you want to delete <strong>{teamToDelete.name}</strong>? 
                            This action cannot be undone and will remove all team data (updates, transactions, milestones). Users will not be deleted.
                        </p>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">
                            Type team name to confirm
                        </label>
                        <input 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none mb-4"
                            placeholder={teamToDelete.name}
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setTeamToDelete(null); setConfirmName(''); }}
                                className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => { onDeleteTeam(teamToDelete.id); setTeamToDelete(null); setConfirmName(''); }}
                                disabled={confirmName !== teamToDelete.name || uploading}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500 disabled:opacity-50"
                            >
                                {uploading ? 'Deleting...' : 'Delete Team'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
