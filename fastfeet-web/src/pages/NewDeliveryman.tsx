import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, CreditCard, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';

interface CreateDeliverymanFormData {
  name: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

export function NewDeliveryman() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateDeliverymanFormData>();
  
  const password = watch('password');

  async function handleCreateDeliveryman(data: CreateDeliverymanFormData) {
    setIsSubmitting(true);
    try {
      await api.post('/users', {
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''), // Remove formatação
        password: data.password,
        role: 'DELIVERYMAN'
      });
      alert("Entregador cadastrado com sucesso!");
      navigate('/deliverymen');
    } catch (error: unknown) {
      console.error('Erro ao cadastrar:', error);
      const message = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erro ao cadastrar entregador';
      alert(message || 'Erro ao cadastrar entregador');
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatCPF(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/deliverymen')}
              className="mr-4 p-2 bg-white rounded-full text-gray-600 hover:text-purple-600 shadow-sm transition-all hover:scale-110"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Novo Entregador</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            
            <form onSubmit={handleSubmit(handleCreateDeliveryman)} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-purple-500" size={20} />
                  </div>
                  <input
                    {...register('name', { required: "O nome é obrigatório" })}
                    type="text"
                    placeholder="Ex: João Silva"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="text-purple-500" size={20} />
                  </div>
                  <input
                    {...register('cpf', { 
                      required: "O CPF é obrigatório",
                      pattern: {
                        value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                        message: "CPF inválido"
                      }
                    })}
                    type="text"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    onChange={(e) => {
                      e.target.value = formatCPF(e.target.value);
                    }}
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono"
                  />
                </div>
                {errors.cpf && <span className="text-red-500 text-xs mt-1">{errors.cpf.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-purple-500" size={20} />
                  </div>
                  <input
                    {...register('password', { 
                      required: "A senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "A senha deve ter no mínimo 6 caracteres"
                      }
                    })}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-purple-500" size={20} />
                  </div>
                  <input
                    {...register('confirmPassword', { 
                      required: "Confirme a senha",
                      validate: value => value === password || "As senhas não coincidem"
                    })}
                    type="password"
                    placeholder="Repita a senha"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</span>}
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/deliverymen')}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all transform hover:scale-[1.02] shadow-md shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Salvando..." : "CADASTRAR"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
