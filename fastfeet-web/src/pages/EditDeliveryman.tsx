import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, CreditCard, Lock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/axios';

interface EditDeliverymanFormData {
  name: string;
  cpf: string;
  password?: string;
  confirmPassword?: string;
}

interface UpdateDeliverymanData {
  name: string;
  cpf: string;
  password?: string;
}

export function EditDeliveryman() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditDeliverymanFormData>();
  
  const password = watch('password');

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((response) => {
        const user = response.data;
        setValue('name', user.name);
        setValue('cpf', formatCPF(user.cpf));
      })
      .catch((error) => {
        console.error('Erro ao carregar entregador:', error);
        alert('Erro ao carregar dados do entregador.');
        navigate('/deliverymen');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, setValue, navigate]);
  
  async function handleUpdateDeliveryman(data: EditDeliverymanFormData) {
    setIsSubmitting(true);
    try {
      const updateData: UpdateDeliverymanData = {
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''),
      };
      
      // Só envia senha se foi preenchida
      if (data.password) {
        updateData.password = data.password;
      }

      await api.patch(`/users/${id}`, updateData);
      alert("Entregador atualizado com sucesso!");
      navigate('/deliverymen');
    } catch (error: unknown) {
      console.error('Erro ao atualizar:', error);
      const message = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar entregador'
        : 'Erro ao atualizar entregador';
      alert(message);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
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
            <h1 className="text-3xl font-bold text-gray-800">Editar Entregador</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            
            <form onSubmit={handleSubmit(handleUpdateDeliveryman)} className="space-y-6">
              
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

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-4">Deixe os campos de senha em branco se não quiser alterá-la</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha (Opcional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-purple-500" size={20} />
                      </div>
                      <input
                        {...register('password', { 
                          minLength: password ? {
                            value: 6,
                            message: "A senha deve ter no mínimo 6 caracteres"
                          } : undefined
                        })}
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-purple-500" size={20} />
                      </div>
                      <input
                        {...register('confirmPassword', { 
                          validate: value => !password || value === password || "As senhas não coincidem"
                        })}
                        type="password"
                        placeholder="Repita a senha"
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    {errors.confirmPassword && <span className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</span>}
                  </div>
                </div>
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
                  {isSubmitting ? "Salvando..." : "ATUALIZAR"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
