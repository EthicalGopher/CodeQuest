import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          const user = session.user;
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          const user = session.user;
          setUser(user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Extract desired properties
  const id = user?.id || null;
  const email = user?.email || null;
  const fullName = user?.user_metadata?.full_name || null;

  return { id, email, fullName, user, loading, error };
};

export default useAuth;
