import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function UserProfile() {
  const { currentUser, userProfile, signInWithGoogle, logout, updateUsername } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  if (!currentUser) {
    return (
      <div className="frosted-glass p-6 w-72 flex flex-col items-center gap-4 border-[rgba(255,255,255,0.1)]">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-2">
          <span className="text-3xl">👤</span>
        </div>
        <h3 className="font-futuristic-header text-lg text-white">Guest Operator</h3>
        <p className="text-white/50 text-sm text-center font-mono-code mb-2">
          Sign in to access global network leaderboards and store your BPS rating.
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); signInWithGoogle(); }}
          className="w-full py-2 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] border border-white/20 transition-all font-futuristic-header text-white flex justify-center items-center gap-2 cursor-pointer"
        >
          <span>Connect Google</span>
        </button>
      </div>
    );
  }

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim().length > 0) {
      updateUsername(editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="frosted-glass p-6 w-72 flex flex-col items-center gap-4 border-[rgba(0,229,255,0.2)] shadow-[0_0_15px_rgba(0,229,255,0.1)]" onClick={(e) => e.stopPropagation()}>
      <div className="relative group">
        {userProfile?.photoURL ? (
          <img src={userProfile.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-cyan)] object-cover shadow-[0_0_10px_var(--color-accent-cyan)]" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-[var(--color-accent-cyan)] flex items-center justify-center shadow-[0_0_10px_var(--color-accent-cyan)]">
            <span className="text-3xl">👤</span>
          </div>
        )}
      </div>

      <div className="w-full text-center">
        {isEditing ? (
          <form onSubmit={handleSaveName} className="flex flex-col gap-2 w-full">
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-black/50 border border-[var(--color-accent-magenta)] text-white px-3 py-1 rounded font-mono-code text-sm w-full outline-none focus:shadow-[0_0_8px_var(--color-accent-magenta)] text-center"
              maxLength={15}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-1 text-xs font-futuristic-header text-white/50 hover:text-white cursor-pointer">Cancel</button>
              <button type="submit" className="flex-1 py-1 text-xs font-futuristic-header text-[var(--color-accent-magenta)] hover:text-white cursor-pointer">Save</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center group">
            <h3 className="font-futuristic-header text-xl text-white group-hover:text-[var(--color-accent-cyan)] transition-colors">
              {userProfile?.username}
            </h3>
            <button
              onClick={() => { setEditName(userProfile?.username || ''); setIsEditing(true); }}
              className="text-xs text-[var(--color-accent-magenta)] opacity-0 group-hover:opacity-100 transition-opacity font-mono-code cursor-pointer"
            >
              [Edit Alias]
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-white/10 my-2" />

      <div className="w-full flex justify-between items-center px-2">
        <span className="text-white/50 text-xs uppercase tracking-widest font-futuristic-header">Top Speed</span>
        <span className="text-[var(--color-accent-cyan)] font-mono-code font-bold drop-shadow-[0_0_5px_var(--color-accent-cyan)]">
          {userProfile?.bps.toFixed(2)} BPS
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); logout(); }}
        className="mt-4 w-full py-1 text-xs font-futuristic-header text-white/30 hover:text-white/80 transition-colors cursor-pointer"
      >
        Disconnect Network
      </button>
    </div>
  );
}
