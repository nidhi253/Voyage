import { supabase } from '../lib/supabase';
import { PREVIEW, loadMock } from '../dev/preview';
import type { Profile } from '../types';

export async function getMyProfile(): Promise<Profile | null> {
  if (PREVIEW) return (await loadMock()).getMyProfile();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export type ProfilePatch = Partial<Pick<Profile, 'name' | 'age' | 'tags' | 'dark_mode' | 'categories'>>;

export async function updateMyProfile(patch: ProfilePatch): Promise<void> {
  if (PREVIEW) return (await loadMock()).updateMyProfile(patch);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You need to be signed in.');
  // upsert so this still works if the signup trigger ever failed to create the row
  const { error } = await supabase.from('profiles').upsert({ id: auth.user.id, ...patch });
  if (error) throw error;
}
