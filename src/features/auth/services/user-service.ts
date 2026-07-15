import { getSupabaseAdminClient } from '@/lib/supabase/client';

export class UserService {
  async getUserByEmail(email: string) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as {
      id: string;
      name: string;
      email: string;
      password_hash: string;
      organization_id: string;
    };
  }

  async getUserById(id: string) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as {
      id: string;
      name: string;
      email: string;
      password_hash: string;
      organization_id: string;
    };
  }
}

export const userService = new UserService();
