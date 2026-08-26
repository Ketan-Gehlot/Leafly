/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, SignupProfileData } from '../types/contracts';

export type { AuthUser, SignupProfileData };

export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('user-not-found') || message.includes('No account found')) {
    return 'No account found with this email address. Please create an account first.';
  }
  if (message.includes('wrong-password') || message.includes('Incorrect password')) {
    return 'Incorrect password. Please try again or use Forgot password.';
  }
  if (message.includes('already exists') || message.includes('email-already-in-use')) {
    return 'An account with this email already exists. Please log in.';
  }
  return message || 'Authentication failed. Please try again.';
}

export interface AuthContextType {
  user: AuthUser | null;
  currentUser: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, profileData?: SignupProfileData | string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, profileData?: SignupProfileData | string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserProfile?: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'leafly_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim();

    if (!cleanEmail || !pass) {
      setLoading(false);
      throw new Error('Please enter both email and password.');
    }

    const isAdminUser = cleanEmail.toLowerCase() === 'leaflydatabase@gmail.com';
    const displayName = cleanEmail.split('@')[0];
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const authenticatedUser: AuthUser = {
      uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: cleanEmail,
      name: capitalizedName,
      fullName: capitalizedName,
      displayName: capitalizedName,
      favoriteTea: null,
      phone: null,
      phoneNumber: null,
      dob: null,
      dateOfBirth: null,
      gender: null,
      preferences: null,
      photoURL: null,
      profileImage: null,
      profileImageUrl: null,
      isAdmin: isAdminUser,
    };

    setUser(authenticatedUser);
    setLoading(false);
  };

  const signup = async (email: string, pass: string, profileData?: SignupProfileData | string) => {
    setLoading(true);
    const cleanEmail = email.trim();

    if (!cleanEmail || !pass) {
      setLoading(false);
      throw new Error('Please enter all required signup fields.');
    }

    const rawName = typeof profileData === 'string' ? profileData : profileData?.name || profileData?.fullName;
    const favoriteTea = typeof profileData === 'object' && profileData !== null ? profileData.favoriteTea : '';
    const phone = typeof profileData === 'object' && profileData !== null ? (profileData.phone as string) : '';
    const resolvedName = rawName || cleanEmail.split('@')[0];

    const newUser: AuthUser = {
      uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: cleanEmail,
      name: resolvedName,
      fullName: resolvedName,
      displayName: resolvedName,
      favoriteTea: favoriteTea || null,
      phone: phone || null,
      phoneNumber: phone || null,
      dob: null,
      dateOfBirth: null,
      gender: null,
      preferences: null,
      photoURL: null,
      profileImage: null,
      profileImageUrl: null,
      isAdmin: cleanEmail.toLowerCase() === 'leaflydatabase@gmail.com',
    };

    setUser(newUser);
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    const googleUser: AuthUser = {
      uid: `usr_g_${Math.random().toString(36).substring(2, 9)}`,
      email: 'tea.enthusiast@leafly.in',
      name: 'Tea Connoisseur',
      fullName: 'Tea Connoisseur',
      displayName: 'Tea Connoisseur',
      favoriteTea: null,
      phone: null,
      phoneNumber: null,
      dob: null,
      dateOfBirth: null,
      gender: null,
      preferences: null,
      photoURL: null,
      profileImage: null,
      profileImageUrl: null,
      isAdmin: false,
    };
    setUser(googleUser);
    setLoading(false);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const sendPasswordReset = async (email: string) => {
    if (!email) throw new Error('Email is required for password recovery.');
    return Promise.resolve();
  };

  const updateUserProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.isAdmin || user?.email === 'leaflydatabase@gmail.com');

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        signInWithEmail: login,
        signUpWithEmail: signup,
        signInWithGoogle: loginWithGoogle,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


