'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'Credenciais inválidas. Verifique seu e-mail e senha.',
          };
        default:
          return { error: 'Ocorreu um erro inesperado.' };
      }
    }
    throw error; // Rethrow necessary for next/navigation redirect in NextAuth
  }
}
