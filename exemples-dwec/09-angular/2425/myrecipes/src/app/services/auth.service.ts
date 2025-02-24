import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw error;
  }

  getUser() {
    return this.supabaseService.client.auth.getUser();
  }
}
