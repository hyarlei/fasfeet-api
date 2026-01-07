/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useState, useContext } from "react";
import { api } from "../lib/axios";
import { useNavigate } from "react-router-dom";

export interface SignInData {
  cpf: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  cpf: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('fastfeet:user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('fastfeet:token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  });

  async function signIn({ cpf, password }: SignInData) {
    const response = await api.post('/sessions', { cpf, password });
    const { access_token, user: userData } = response.data;

    localStorage.setItem('fastfeet:token', access_token);
    localStorage.setItem('fastfeet:user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    setUser(userData);
    setIsAuthenticated(true);
    
    if (userData.role === 'ADMIN') {
      navigate('/dashboard');
    } else if (userData.role === 'DELIVERYMAN') {
      navigate('/my-orders');
    } else {
      navigate('/dashboard');
    }
  }

  function signOut() {
    localStorage.removeItem('fastfeet:token');
    localStorage.removeItem('fastfeet:user');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext);
}