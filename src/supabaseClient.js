import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  if (data.user) {
    // await upsertPlayerProfile(data.user);
  }
  return data;
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (data.user) {
    // await upsertPlayerProfile(data.user);
  }
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  if (data.user) {
    // await upsertPlayerProfile(data.user);
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function upsertPlayerState(playerInfo) {
  const { uuid, x, y, animation, direction, email, username, sprite_sheet, server_id = null } = playerInfo;
  const { error } = await supabase.from('player').upsert({
    id: uuid, // Map uuid from playerInfo to the 'id' column in the table
    x,
    y,
    animation,
    direction,
    email,
    username,
    sprite_sheet,
    server_id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' }); // Conflict on 'id' column

  if (error) {
    console.error('Error upserting player state:', error);
    throw error;
  }
}




