import React from 'react';
import useGuildStore from '../store/useGuildStore';
import useAuthStore from '../store/useAuthStore';

const roleLabels = { leader: 'Leader', 'co-leader': 'Co-Leader', member: 'Member' };
const roleColors = { leader: 'text-yellow-500', 'co-leader': 'text-blue-500', member: 'text-gray-500' };

function GuildMemberList({ guild }) {
  const user = useAuthStore((s) => s.user);
  const kickMember = useGuildStore((s) => s.kickMember);
  const promoteMember = useGuildStore((s) => s.promoteMember);

  const myMember = guild?.members?.find(m => m.user?._id === user?._id);
  const isLeader = myMember?.role === 'leader';
  const isCoLeader = myMember?.role === 'co-leader';
  const canManage = isLeader || isCoLeader;

  return (
    <div className="space-y-2">
      {guild?.members?.map((member) => {
        const isMe = member.user?._id === user?._id;
        return (
          <div key={member.user?._id || member._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f1a14] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                {member.user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-white">
                  {member.user?.username} {isMe && <span className="text-xs text-gray-400">(bạn)</span>}
                </p>
                <p className={`text-xs font-medium ${roleColors[member.role]}`}>
                  {roleLabels[member.role]}
                </p>
              </div>
            </div>
            {canManage && !isMe && member.role !== 'leader' && (
              <div className="flex gap-1">
                {isLeader && (
                  <>
                    <button
                      onClick={() => promoteMember(guild._id, member.user._id, 'co-leader')}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                      title="Promote"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => promoteMember(guild._id, member.user._id, 'member')}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                      title="Demote"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Kick ${member.user?.username}?`)) kickMember(guild._id, member.user._id);
                  }}
                  className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded"
                  title="Kick"
                >
                  <span className="material-symbols-outlined text-sm">person_remove</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default GuildMemberList;
