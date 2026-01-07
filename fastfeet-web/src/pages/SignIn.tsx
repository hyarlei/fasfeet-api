import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function SignIn() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useAuth();

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();

    try {
      await signIn({ cpf, password });
    } catch (error) { 
      console.error(error);
      alert('Falha no login. Verifique seu CPF/Senha.');
    }
  }

  return (
    <div className="h-screen w-screen bg-brand-purple flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-3xl">📦</span>
          <h1 className="text-3xl font-bold text-brand-purple italic">FastFeet</h1>
        </div>

        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-600" htmlFor="cpf">Seu CPF</label>
            <input 
              id="cpf"
              className="border border-gray-300 rounded p-3 focus:outline-none focus:border-brand-purple transition-colors"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-600" htmlFor="password">Sua senha</label>
            <input 
              id="password"
              type="password"
              className="border border-gray-300 rounded p-3 focus:outline-none focus:border-brand-purple transition-colors"
              placeholder="*************"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="mt-4 bg-brand-purple text-white font-bold py-3 rounded hover:bg-violet-600 transition-colors"
          >
            Entrar no sistema
          </button>
        </form>
      </div>
    </div>
  )
}