import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Truck, PackageCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/axios';

interface EditOrderFormData {
  recipient_id: string;
  deliveryman_id: string;
  product: string;
  status: string;
}

interface Option {
  id: string;
  name: string;
}

interface Order {
  id: string;
  recipient_id: string;
  deliveryman_id: string;
  product?: string;
  status: string;
  tracking_code: string;
  recipient: {
    id: string;
    name: string;
  };
  deliveryman: {
    id: string;
    name: string;
  };
}

export function EditOrder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [recipients, setRecipients] = useState<Option[]>([]);
  const [deliverymen, setDeliverymen] = useState<Option[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditOrderFormData>();

  useEffect(() => {
    Promise.all([
      api.get(`/orders/${id}`),
      api.get('/deliverymen'),
      api.get('/recipients'),
    ])
    .then(([orderResponse, deliverymenResponse, recipientsResponse]) => {
      const order: Order = orderResponse.data;
      
      // Preenche o formulário com os dados atuais
      setValue('recipient_id', order.recipient_id);
      setValue('deliveryman_id', order.deliveryman_id);
      setValue('product', order.product || '');
      setValue('status', order.status);
      
      setDeliverymen(deliverymenResponse.data);
      setRecipients(recipientsResponse.data);
    })
    .catch((error) => {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da encomenda.');
      navigate('/orders');
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [id, setValue, navigate]);
  
  async function handleUpdateOrder(data: EditOrderFormData) {
    setIsSubmitting(true);
    try {
      await api.put(`/orders/${id}`, data);
      alert("Encomenda atualizada com sucesso!");
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert("Erro ao atualizar encomenda");
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
              onClick={() => navigate('/orders')}
              className="mr-4 p-2 bg-white rounded-full text-gray-600 hover:text-purple-600 shadow-sm transition-all hover:scale-110"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Editar Encomenda</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            
            <form onSubmit={handleSubmit(handleUpdateOrder)} className="space-y-6">
              
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  {...register('status', { required: "Selecione um status" })}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="WAITING">Aguardando</option>
                  <option value="PENDING">Pendente</option>
                  <option value="WITHDRAWN">Retirada</option>
                  <option value="DELIVERED">Entregue</option>
                  <option value="CANCELED">Cancelada</option>
                </select>
                {errors.status && <span className="text-red-500 text-xs mt-1">{errors.status.message}</span>}
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
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
