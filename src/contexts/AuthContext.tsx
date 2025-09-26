import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseAuthUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  query,
  where,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { FirebaseUser } from '../types/firebase';
import { Timestamp } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string, screenName: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  checkScreenNameExists: (screenName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if screen name already exists
  const checkScreenNameExists = async (screenName: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('screenName', '==', screenName));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking screen name:', error);
      return false;
    }
  };

  // Sign up new user
  const signup = async (email: string, password: string, firstName: string, lastName: string, screenName: string) => {
    try {
      // Check if screen name already exists
      const screenNameExists = await checkScreenNameExists(screenName);
      if (screenNameExists) {
        throw new Error('Screen name already exists. Please choose a different one.');
      }

      // Create Firebase auth user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase auth profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      const userData: FirebaseUser = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        screenName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in existing user
  const signin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Signin error:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Invalid password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else {
        throw new Error('Sign in failed. Please try again.');
      }
    }
  };

  // Sign out user
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now()
      });

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Get user data from Firestore
  const getUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as FirebaseUser;
        return {
          uid: data.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          screenName: data.screenName,
          profilePicture: data.profilePicture
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their data from Firestore
        const userData = await getUserData(firebaseUser.uid);
        setCurrentUser(userData);
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    signin,
    logout,
    updateUserProfile,
    checkScreenNameExists
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}