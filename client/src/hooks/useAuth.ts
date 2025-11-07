import { useState, useEffect } from "react";
import { authHelpers } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    authHelpers.getSession().then((session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const data = await authHelpers.signUp(email, password, fullName);
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const data = await authHelpers.signIn(email, password);
    return data;
  };

  const signOut = async () => {
    await authHelpers.signOut();
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
