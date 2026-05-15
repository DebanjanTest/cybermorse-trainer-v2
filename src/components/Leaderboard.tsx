import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfileData } from '../context/AuthContext';

export function Leaderboard() {
  const [topUsers, setTopUsers] = useState<UserProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query users collection, order by 'bps' descending, limit to top 10
    const q = query(collection(db, 'users'), orderBy('bps', 'desc'), limit(10));

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users: UserProfileData[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfileData);
      });
      setTopUsers(users);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="frosted-glass p-6 w-72 flex flex-col gap-4 border-[rgba(255,45,125,0.2)] shadow-[0_0_15px_rgba(255,45,125,0.1)] h-[400px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="font-futuristic-header text-lg text-white uppercase tracking-widest">Global Rank</h3>
        <span className="text-[var(--color-accent-magenta)] text-xl drop-shadow-[0_0_5px_var(--color-accent-magenta)]">🌐</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
        {loading ? (
          <div className="text-white/50 text-sm font-mono-code text-center mt-10 animate-pulse">Syncing Network...</div>
        ) : topUsers.length === 0 ? (
          <div className="text-white/50 text-sm font-mono-code text-center mt-10">No data available</div>
        ) : (
          topUsers.map((user, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            let rankColor = 'text-white/50';
            let rankGlow = '';

            if (isFirst) {
              rankColor = 'text-[var(--color-accent-magenta)]';
              rankGlow = 'drop-shadow-[0_0_8px_var(--color-accent-magenta)]';
            } else if (isSecond) {
              rankColor = 'text-[var(--color-accent-cyan)]';
              rankGlow = 'drop-shadow-[0_0_5px_var(--color-accent-cyan)]';
            } else if (isThird) {
              rankColor = 'text-white';
            }

            return (
              <div key={user.uid} className="flex items-center justify-between bg-white/5 p-2 rounded hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`font-futuristic-header font-bold text-sm ${rankColor} ${rankGlow} w-4`}>
                    #{index + 1}
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">👤</div>
                  )}
                  <span className="font-mono-code text-sm text-white truncate w-24" title={user.username || 'Unknown'}>
                    {user.username || 'Unknown'}
                  </span>
                </div>
                <div className="font-mono-code font-bold text-sm text-[var(--color-accent-cyan)]">
                  {user.bps.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 45, 125, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
