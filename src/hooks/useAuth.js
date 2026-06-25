import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Check your email if confirmation is enabled.");
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, authLoading, signUp, signIn, signOut };
}
