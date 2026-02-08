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
    await upsertPlayerProfile(data.user);
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
    await upsertPlayerProfile(data.user);
  }
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  if (data.user) {
    await upsertPlayerProfile(data.user);
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

async function upsertPlayerProfile(user) {
  const { data: existingProfile, error: selectError } = await supabase
    .from('player')
    .select('id, sprite_sheet')
    .eq('id', user.id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking for existing player profile:', selectError);
    throw selectError;
  }

  if (existingProfile && existingProfile.sprite_sheet) {
    return existingProfile;
  }
  

  const { data: files, error: listError } = await supabase.storage.from('spritsheet').list();
  if (listError) {
    console.error('Error listing spritesheets:', listError);
    throw listError;
  }

  const spriteCount = files.filter(f => f.name.startsWith('sprite-')).length;
  if (spriteCount === 0) {
    console.error('No spritesheets found in the bucket starting with "sprite-".');
    const { data, error } = await supabase.from('player').upsert({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.full_name || user.email,
    }, { onConflict: 'id' });
    if (error) throw error;
    return data;
  }

  const randomIndex = Math.floor(Math.random() * spriteCount) + 1;
  const spriteFileName = `sprite-${randomIndex}.png`;
  
  const { data: { publicUrl } } = supabase.storage.from('spritsheet').getPublicUrl(spriteFileName);

  const { data: updatedUserData, error: updateUserError } = await supabase.auth.updateUser({
    data: { sprite_sheet: publicUrl }
  });
  if (updateUserError) {
    console.error('Error updating user metadata:', updateUserError);
    throw updateUserError;
  }
  const updatedUser = updatedUserData.user;

  const { data, error } = await supabase
    .from('player')
    .upsert(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.user_metadata?.full_name || updatedUser.email,
        sprite_sheet: publicUrl
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error upserting player profile:', error);
    throw error;
  }
  return data;
}

