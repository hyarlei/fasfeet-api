import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Truck, PackageCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';

interface CreateOrderFormData {
  recipient_id: string;
  deliveryman_id: string;
  product: string;
}

interface Option {
  id: string;
  name: string;
}

export function CreateOrder() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [recipients, setRecipients] = useState<Option[]>([]);
  const [deliverymen, setDeliverymen] = useState<Option[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrderFormData>();

  useEffect(() => {
    Promise.all([
      api.get('/deliverymen'),
      api.get('/recipients'),
    ])
    .then(([deliverymenResponse, recipientsResponse]) => {
      setDeliverymen(deliverymenResponse.data);
      setRecipients(recipientsResponse.data);
    })
    .catch(() => {
      alert('Erro ao carregar dados de entregadores e destinatários.');
    });
  }, []);

  async function handleCreateOrder(data: CreateOrderFormData) {
    setIsSubmitting(true);
    try {
      await api.post('/orders', data);
      alert("Encomenda cadastrada com sucesso!");
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert("Erro ao cadastrar encomenda");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 bg-white rounded-full text-gray-600 hover:text-purple-600 shadow-sm transition-all hover:scale-110"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Nova Encomenda</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            
            <form onSubmit={handleSubmit(handleCreateOrder)} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destinatário</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-purple-500" size={20} />
                  </div>
                  <select
                    {...register('recipient_id', { required: "Selecione um destinatário" })}
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione quem vai receber...</option>
                    {recipients.map(recipient => (
                      <option key={recipient.id} value={recipient.id}>{recipient.name}</option>
                    ))}
                  </select>
                </div>
                {errors.recipient_id && <span className="text-red-500 text-xs mt-1">{errors.recipient_id.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Entregador</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="text-purple-500" size={20} />
                  </div>
                  <select
                    {...register('deliveryman_id', { required: "Selecione um entregador" })}
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione o responsável...</option>
                    {deliverymen.map(man => (
                      <option key={man.id} value={man.id}>{man.name}</option>
                    ))}
                  </select>
                </div>
                {errors.deliveryman_id && <span className="text-red-500 text-xs mt-1">{errors.deliveryman_id.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PackageCheck className="text-purple-500" size={20} />
                  </div>
                  <input
                    {...register('product', { required: "O nome do produto é obrigatório" })}
                    type="text"
                    placeholder="Ex: Monitor 24 polegadas"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                {errors.product && <span className="text-red-500 text-xs mt-1">{errors.product.message}</span>}
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
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