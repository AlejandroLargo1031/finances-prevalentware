'use client';

import EmailLoginForm from './components/EmailSignIn';
import GithubLoginButton from './components/GithubSignIn';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-6">Inicia sesión</h1>
      
      <EmailLoginForm />

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">o</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <GithubLoginButton />
    </div>
  );
}