import React from 'react';
import { Users } from 'lucide-react';
import TeamLogo from './TeamLogo';

const TeamCard = ({ team, onClick, phasesByCohort }) => {
  // Logic updated to count Approved tasks only
  const submissions = team.team_submissions
    ? (team.team_submissions || []).reduce((acc, sub) => {
        acc[sub.task_id] = sub;
        return acc;
      }, {})
    : (team.submissions || {});
  const cohortPhases = phasesByCohort?.[team.cohort_id] || [];
  const taskIdSet = new Set(cohortPhases.flatMap(p => (p.tasks || []).map(t => t.id)));
  const totalTasks = taskIdSet.size;
  const approvedCount = Object.values(submissions).filter(s => taskIdSet.has(s.task_id) && s.status === 'approved').length;
  const progress = totalTasks > 0 ? Math.round((approvedCount / totalTasks) * 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 shadow-sm hover:border-yellow-600/50 transition cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <TeamLogo url={team.logo_display_url || team.logo_url} name={team.name} />
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition truncate">
              {team.name}
            </h3>
            <p className="text-sm text-neutral-400 line-clamp-1">{team.description}</p>
          </div>
        </div>
        <span className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-1 rounded-full font-medium border border-yellow-600/20">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-yellow-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-neutral-500">
        <Users className="w-3 h-3" />
        <span>{team.members ? team.members.length : 0} members</span>
      </div>
    </div>
  );
};

export default TeamCard;
