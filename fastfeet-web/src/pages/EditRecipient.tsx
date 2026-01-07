import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, MapPin, Home, Hash } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/axios';

interface EditRecipientFormData {
  name: string;
  street: string;
  number: number;
  complement?: string;
  city: string;
  state: string;
  zipcode: string;
}

export function EditRecipient() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditRecipientFormData>();

  useEffect(() => {
    api
      .get(`/recipients/${id}`)
      .then((response) => {
        const recipient = response.data;
        setValue('name', recipient.name);
        setValue('street', recipient.street);
        setValue('number', recipient.number);
        setValue('complement', recipient.complement || '');
        setValue('city', recipient.city);
        setValue('state', recipient.state);
        setValue('zipcode', recipient.zipcode);
      })
      .catch((error) => {
        console.error('Erro ao carregar destinatário:', error);
        alert('Erro ao carregar dados do destinatário.');
        navigate('/recipients');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, setValue, navigate]);
  
  async function handleUpdateRecipient(data: EditRecipientFormData) {
    setIsSubmitting(true);
    try {
      await api.put(`/recipients/${id}`, data);
      alert("Destinatário atualizado com sucesso!");
      navigate('/recipients');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert("Erro ao atualizar destinatário");
    } finally {
      setIsSubmitting(false);
    }
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
              onClick={() => navigate('/recipients')}
              className="mr-4 p-2 bg-white rounded-full text-gray-600 hover:text-purple-600 shadow-sm transition-all hover:scale-110"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Editar Destinatário</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            
            <form onSubmit={handleSubmit(handleUpdateRecipient)} className="space-y-6">
              
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rua</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="text-purple-500" size={20} />
                    </div>
                    <input
                      {...register('street', { required: "A rua é obrigatória" })}
                      type="text"
                      placeholder="Ex: Rua das Flores"
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  {errors.street && <span className="text-red-500 text-xs mt-1">{errors.street.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="text-purple-500" size={20} />
                    </div>
                    <input
                      {...register('number', { 
                        required: "O número é obrigatório",
                        valueAsNumber: true
                      })}
                      type="number"
                      placeholder="123"
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  {errors.number && <span className="text-red-500 text-xs mt-1">{errors.number.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento (Opcional)</label>
                <input
                  {...register('complement')}
                  type="text"
                  placeholder="Ex: Apto 101, Bloco A"
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="text-purple-500" size={20} />
                    </div>
                    <input
                      {...register('city', { required: "A cidade é obrigatória" })}
                      type="text"
                      placeholder="Ex: São Paulo"
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  {errors.city && <span className="text-red-500 text-xs mt-1">{errors.city.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado (UF)</label>
                  <input
                    {...register('state', { 
                      required: "O estado é obrigatório",
                      maxLength: { value: 2, message: "Use apenas a sigla (ex: SP)" }
                    })}
                    type="text"
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all uppercase"
                  />
                  {errors.state && <span className="text-red-500 text-xs mt-1">{errors.state.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
                <input
                  {...register('zipcode', { required: "O CEP é obrigatório" })}
                  type="text"
                  placeholder="12345-678"
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono"
                />
                {errors.zipcode && <span className="text-red-500 text-xs mt-1">{errors.zipcode.message}</span>}
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/recipients')}
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
