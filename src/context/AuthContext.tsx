import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  bps: number; // Best score: Bytes/Beats Per Second
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  updateHighScore: (newBps: number) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data from Firestore
  const fetchOrInitializeUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfileData);
    } else {
      // Create new profile
      const newProfile: UserProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: user.displayName || 'Anonymous Player',
        bps: 0,
      };
      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await fetchOrInitializeUserProfile(user);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (!currentUser || !userProfile) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { ...userProfile, username: newUsername }, { merge: true });
    setUserProfile({ ...userProfile, username: newUsername });
  };

  const updateHighScore = async (newBps: number) => {
    if (!currentUser || !userProfile) return;

    // Only update if the new score is strictly better
    if (newBps > userProfile.bps) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { ...userProfile, bps: newBps }, { merge: true });
      setUserProfile({ ...userProfile, bps: newBps });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      signInWithGoogle,
      logout,
      updateUsername,
      updateHighScore,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
