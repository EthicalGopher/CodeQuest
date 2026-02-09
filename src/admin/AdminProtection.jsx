import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

const AdminProtection = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading) {
        if (user) {
          try {
            const { data, error } = await supabase
              .from('admins') // Assuming you have an 'admins' table
              .select('id')
              .eq('id', user.id)
              .single();

            if (data) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              if (error && error.code !== 'PGRST116') {
                console.error('Error checking admin status:', error);
              }
            }
          } catch (err) {
            console.error('Unexpected error checking admin status:', err);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, loading]);

  if (loading || checkingAdmin) {
    return <p>Loading...</p>; // Or a loading spinner
  }

  if (!isAdmin) {
    return user ? <Navigate to="/unauthorized" /> : <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminProtection;
