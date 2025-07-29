'use client';

import EmailLoginForm from './components/EmailSignIn';
import GithubLoginButton from './components/GithubSignIn';
import { Laptop } from 'lucide-react';

export default function LoginPage() {
  return (
    <>
    <h1 className="text-2xl font-bold text-center mt-20"> Aplicacion de Finanzas v 1.0</h1>
      <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Inicia sesión</h2>

        <EmailLoginForm />

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">o</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <GithubLoginButton />
      </div>
      <div className="mt-10 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <Laptop className="w-4 h-4" />
          <span className="font-semibold text-gray-700">
            By Alejandro Largo
          </span>
          <Laptop className="w-4 h-4" />
        </div>
        <p className="text-[12px] mt-1">Fullstack Developer</p>
      </div>
    </>
  );
}
