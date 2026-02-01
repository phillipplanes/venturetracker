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

const AdminDashboard = ({ supabase, teams = [], admins = [], profiles = [], settings, cohortPhasesById = {}, onUpdateSettings, onAddAdmin, onRemoveAdmin, onUpdateProfile, onViewTeam, onDeleteTeam, onCreateTeam, onUpdateTeam, onAssignCohort, onCreateUser, uploading }) => {
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
    const [selectedMilestoneCohort, setSelectedMilestoneCohort] = useState('');
    const [copying, setCopying] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [bannerStatus, setBannerStatus] = useState({});
    const [dateStatus, setDateStatus] = useState({});
    const adminCardClass = "w-full";

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

    const handleCreateCohort = async () => {
        if (!newCohortName.trim()) return;
        const { error } = await supabase.from('cohorts').insert([{
            name: newCohortName,
            status: newCohortStatus,
            start_date: newCohortStart || null,
            end_date: newCohortEnd || null
        }]);
        if (!error) {
            setNewCohortName('');
            setNewCohortStatus('active');
            setNewCohortStart('');
            setNewCohortEnd('');
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

                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
                            <h3 className="font-bold text-white">Team Overview</h3>
                            <p className="text-xs text-neutral-500 mt-1">Progress, pending approvals, and quick access.</p>
                        </div>
                        <div className="divide-y divide-neutral-800">
                            {teams.map(team => {
                                const phases = cohortPhasesById[team.cohort_id] || [];
                                const taskIdSet = new Set(phases.flatMap(p => (p.tasks || []).map(t => t.id)));
                                const totalTasks = taskIdSet.size;
                                const submissions = (team.team_submissions || []).reduce((acc, sub) => {
                                    acc[sub.task_id] = sub;
                                    return acc;
                                }, {});
                                const approvedCount = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'approved').length;
                                const pendingCount = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'pending').length;
                                const progress = totalTasks > 0 ? Math.round((approvedCount / totalTasks) * 100) : 0;
                                const pendingTasks = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'pending').slice(0, 3);
                                const memberProfiles = (team.members || [])
                                    .map(id => profiles.find(p => p.id === id))
                                    .filter(Boolean);

                                return (
                                    <div key={team.id} className="p-4 hover:bg-neutral-800/40 transition">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <TeamLogo url={team.logo_display_url || team.logo_url} name={team.name} className="w-12 h-12 rounded-lg" iconSize="w-5 h-5" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h4 className="font-bold text-white truncate">{team.name}</h4>
                                                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                                                            {team.members?.length || 0} members
                                                        </span>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                                                            pendingCount > 0 ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                                        }`}>
                                                            {pendingCount} pending approvals
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-400 line-clamp-1">{team.description || 'No description yet.'}</p>
                                                    {memberProfiles.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {memberProfiles.slice(0, 6).map((m) => (
                                                                <span key={m.id} className="text-[10px] text-neutral-300 bg-neutral-800 border border-neutral-700 px-2 py-1 rounded-full">
                                                                    {m.email || m.full_name || m.id}
                                                                </span>
                                                            ))}
                                                            {memberProfiles.length > 6 && (
                                                                <span className="text-[10px] text-neutral-500">+{memberProfiles.length - 6} more</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {pendingTasks.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {pendingTasks.map((p, i) => (
                                                                <span key={i} className="text-[10px] text-yellow-300 bg-yellow-900/20 border border-yellow-800/50 px-2 py-1 rounded-full">
                                                                    {p.summary ? `${p.summary.slice(0, 48)}${p.summary.length > 48 ? '…' : ''}` : 'Pending task'}
                                                                </span>
                                                            ))}
                                                            {pendingCount > 3 && (
                                                                <span className="text-[10px] text-neutral-500">+{pendingCount - 3} more</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 md:justify-end">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-yellow-500">{progress}%</div>
                                                    <p className="text-[10px] text-neutral-500">Complete</p>
                                                </div>
                                                <button onClick={() => onViewTeam(team)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-md border border-neutral-700 transition">
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {teams.length === 0 && (
                                <div className="p-8 text-center text-neutral-600 italic">No teams yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'teams' && (
                <div className="space-y-4 w-full">
                        <div className="flex justify-end">
                            <button onClick={() => setEditingTeam({ name: '', description: '' })} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 text-sm flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Team
                            </button>
                        </div>
                        {teams.map(team => (
                        <div key={team.id} className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <TeamLogo url={team.logo_display_url || team.logo_url} name={team.name} />
                                <div>
                                    <h4 className="font-bold text-white">{team.name}</h4>
                                    <p className="text-xs text-neutral-500">{team.members?.length || 0} members</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={team.cohort_id || ''}
                                    onChange={(e) => onAssignCohort(team.id, e.target.value)}
                                    className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-md px-2 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    <option value="">Assign Cohort...</option>
                                    {cohorts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => setEditingTeam(team)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-md border border-neutral-700 transition flex items-center gap-1">
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button onClick={() => onViewTeam(team)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-md border border-neutral-700 transition">
                                    View Dashboard
                                </button>
                                <button 
                                    onClick={() => setTeamToDelete(team)} 
                                    className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-2 rounded-md border border-red-900/30 transition flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'cohorts' && (
                <div className="space-y-8 w-full flex flex-col md:items-center">
                    <div className={`bg-neutral-900 p-6 rounded-xl border border-neutral-800 ${adminCardClass}`}>
                        <h3 className="text-lg font-bold text-white mb-4">Create New Cohort</h3>
                        <div className="grid md:grid-cols-6 gap-3">
                            <input 
                                className="w-full md:col-span-2 bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white outline-none focus:border-yellow-500"
                                placeholder="e.g., Fall 2024"
                                value={newCohortName}
                                onChange={(e) => setNewCohortName(e.target.value)}
                            />
                            <select
                                value={newCohortStatus}
                                onChange={(e) => setNewCohortStatus(e.target.value)}
                                className="md:col-span-1 bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                            </select>
                            <input
                                type="date"
                                value={newCohortStart}
                                onChange={(e) => setNewCohortStart(e.target.value)}
                                className="md:col-span-1 bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                            <input
                                type="date"
                                value={newCohortEnd}
                                onChange={(e) => setNewCohortEnd(e.target.value)}
                                className="md:col-span-1 bg-neutral-950 border border-neutral-700 text-neutral-300 rounded-lg px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                            <button onClick={handleCreateCohort} disabled={!newCohortName.trim() || uploading} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                                Create
                            </button>
                        </div>
                    </div>
                    <div className={`bg-neutral-900 p-6 rounded-xl border border-neutral-800 ${adminCardClass}`}>
                        <h3 className="text-lg font-bold text-white mb-4">Existing Cohorts</h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700">
                            {cohorts.length === 0 && <p className="text-sm text-neutral-500 italic">No cohorts created yet.</p>}
                            {cohorts.map(cohort => {
                                const teamsInCohort = teams.filter(t => t.cohort_id === cohort.id);
                                const canDelete = teamsInCohort.length === 0;

                                return (
                                    <div key={cohort.id} className="flex flex-col gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                          <div>
                                            <p className="text-white font-medium">{cohort.name}</p>
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
                                                className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-md px-2 py-2 focus:ring-yellow-500 focus:border-yellow-500"
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
                                                disabled={copying}
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
                                              placeholder="Overrides global banner for teams in this cohort"
                                              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500"
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
                                                }
                                              }}
                                              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3 py-2 rounded-md border border-neutral-700"
                                            >
                                              Save
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
                                          <label className="block text-[10px] text-neutral-500 uppercase mb-1">Cohort Dates</label>
                                          <div className="flex flex-col md:flex-row gap-2">
                                            <input
                                              type="date"
                                              value={cohort.start_date || ''}
                                              onChange={(e) => {
                                                const next = e.target.value;
                                                setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, start_date: next } : c));
                                                setDateStatus(prev => ({ ...prev, [cohort.id]: '' }));
                                              }}
                                              className="bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500"
                                            />
                                            <input
                                              type="date"
                                              value={cohort.end_date || ''}
                                              onChange={(e) => {
                                                const next = e.target.value;
                                                setCohorts(prev => prev.map(c => c.id === cohort.id ? { ...c, end_date: next } : c));
                                                setDateStatus(prev => ({ ...prev, [cohort.id]: '' }));
                                              }}
                                              className="bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-200 outline-none focus:border-yellow-500"
                                            />
                                            <button
                                              onClick={async () => {
                                                setDateStatus(prev => ({ ...prev, [cohort.id]: 'saving' }));
                                                const { error } = await supabase.from('cohorts').update({
                                                  start_date: cohort.start_date || null,
                                                  end_date: cohort.end_date || null
                                                }).eq('id', cohort.id);
                                                if (error) {
                                                  setDateStatus(prev => ({ ...prev, [cohort.id]: 'error' }));
                                                } else {
                                                  setDateStatus(prev => ({ ...prev, [cohort.id]: 'saved' }));
                                                }
                                              }}
                                              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3 py-2 rounded-md border border-neutral-700"
                                            >
                                              Save Dates
                                            </button>
                                          </div>
                                          {dateStatus[cohort.id] === 'saved' && (
                                            <p className="text-[10px] text-green-400 mt-1">Dates saved</p>
                                          )}
                                          {dateStatus[cohort.id] === 'error' && (
                                            <p className="text-[10px] text-red-400 mt-1">Date save failed</p>
                                          )}
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
                            <button onClick={() => setIsCreatingUser(true)} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 text-sm flex items-center justify-center gap-2">
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
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    profile.role === 'admin' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    profile.role === 'mentor' ? 'bg-blue-900/30 text-blue-400' :
                                                    'bg-neutral-800 text-neutral-300'
                                                }`}>{profile.role}</span>
                                                <label className="flex items-center gap-2 text-xs text-neutral-400">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isAdmin} 
                                                        onChange={(e) => e.target.checked ? onAddAdmin(profile.email) : onRemoveAdmin(admins.find(a => a.email === profile.email)?.id)}
                                                        className="rounded bg-neutral-800 border-neutral-700 text-yellow-600 focus:ring-yellow-600"
                                                    />
                                                    Admin
                                                </label>
                                            </div>
                                        </div>
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
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    profile.role === 'admin' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    profile.role === 'mentor' ? 'bg-blue-900/30 text-blue-400' :
                                                    'bg-neutral-800 text-neutral-300'
                                                }`}>{profile.role}</span>
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
                                                    className="rounded bg-neutral-800 border-neutral-700 text-yellow-600 focus:ring-yellow-600"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredProfiles.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center text-neutral-600 italic">No users found.</td></tr>
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
                        <select
                            value={selectedMilestoneCohort}
                            onChange={(e) => setSelectedMilestoneCohort(e.target.value)}
                            className="w-full md:w-1/2 bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white outline-none focus:border-yellow-500"
                        >
                            <option value="">-- Choose a cohort --</option>
                            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
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
                                                onChange={(e) => handleMilestoneChange(phaseIndex, null, 'title', e.target.value)}
                                                onBlur={() => handleMilestoneBlur(phaseIndex, null)}
                                            />
                                            <button onClick={() => removePhase(phaseIndex)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            {phase.tasks.map((task, taskIndex) => (
                                                <div key={task.id} className="flex items-center gap-2">
                                                    <input 
                                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white outline-none focus:border-yellow-500"
                                                        value={task.label}
                                                        onChange={(e) => handleMilestoneChange(phaseIndex, taskIndex, 'label', e.target.value)}
                                                        onBlur={() => handleMilestoneBlur(phaseIndex, taskIndex)}
                                                    />
                                                    <button onClick={() => removeTask(phaseIndex, taskIndex)} className="text-neutral-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addTask(phaseIndex)} className="text-sm text-yellow-500 hover:text-yellow-400 mt-2">+ Add Task</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addPhase} className="text-sm text-green-500 hover:text-green-400 mt-4">+ Add Phase</button>
                            </div>
                        ) : (
                            <div className="text-center bg-neutral-950 border-2 border-dashed border-neutral-800 p-8 rounded-lg animate-fade-in">
                                <h4 className="text-lg font-bold text-white">This cohort has no milestones.</h4>
                                <p className="text-neutral-400 mb-6">Get started by creating new phases or copying from another cohort.</p>
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={addPhase} className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500">Create First Phase</button>
                                    <span className="text-neutral-600">or</span>
                                    <select onChange={(e) => handleCopyMilestones(e.target.value)} disabled={copying} className="bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500">
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
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Banner Message</label>
                            <input className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={bannerMsg} onChange={e => setBannerMsg(e.target.value)} />
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
                            />
                        </div>
                        <button onClick={saveSettings} disabled={uploading} className="bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">{uploading ? 'Saving...' : 'Save Settings'}</button>
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
