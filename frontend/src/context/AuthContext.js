import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (sessionUser) => {
    if (!sessionUser) {
      setProfile(null);
      setRole('user');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.warn("[AuthContext] Profile fetch error:", error.message);
        // Fallback profile if row not created yet
        setProfile({ id: sessionUser.id, email: sessionUser.email, role: 'user' });
        setRole('user');
      } else if (data) {
        setProfile(data);
        setRole(data.role || 'user');
      }
    } catch (e) {
      console.error("[AuthContext] fetchProfile exception:", e);
    }
  };

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
        setRole('user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await fetchProfile(data.user);
    }
    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await fetchProfile(data.user);
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("SignOut error:", error);
    setUser(null);
    setProfile(null);
    setRole('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isSuperAdmin: role === 'super_admin',
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile: () => fetchProfile(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
