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
