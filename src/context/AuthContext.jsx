
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../createClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Unable to load session:", error.message);
      }

      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp({ fullName, email, password, role }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async function updateProfile({ fullName, password }) {
  const updates = {
    data: {
      full_name: fullName.trim(),
    },
  };

  // Update password only if the user entered one
  if (password) {
    updates.password = password;
  }

  const { data, error } = await supabase.auth.updateUser(updates);

  if (error) {
    throw error;
  }

  return data;
}

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  
  async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}
const value = {
  user,
  session,
  role: user?.user_metadata?.role ?? null,
  loading,
  signUp,
  signIn,
  signOut,
  updateProfile,
};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
