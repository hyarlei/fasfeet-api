import { useState, useEffect, useRef } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  TruckIcon,
  MapPin,
  Calendar,
  User,
  Camera
} from 'lucide-react';
import { api } from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

type OrderStatus = 'WAITING' | 'PENDING' | 'WITHDRAWN' | 'DELIVERED' | 'RETURNED';

interface Order {
  id: string;
  recipient: {
    name: string;
    street: string;
    number: number;
    complement?: string;
    city: string;
    state: string;
    zipcode: string;
  };
  status: OrderStatus;
  tracking_code: string;
  created_at: string;
  withdrawn_at?: string;
  delivered_at?: string;
  photo_url?: string;
}

export function DeliverymanOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    api
      .get(`/users/${user.id}/orders`)
      .then((response) => {
        setOrders(response.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar encomendas:', err);
      });
  }, [user]);

  function getStatusStyles(status: OrderStatus) {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'WAITING':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'WITHDRAWN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RETURNED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  function getStatusLabel(status: OrderStatus) {
    const labels = {
      WAITING: 'Aguardando',
      PENDING: 'Pendente',
      WITHDRAWN: 'Retirada',
      DELIVERED: 'Entregue',
      RETURNED: 'Devolvida'
    };
    return labels[status] || 'Desconhecido';
  }

  function getStatusIcon(status: OrderStatus) {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle size={20} />;
      case 'WITHDRAWN':
        return <TruckIcon size={20} />;
      case 'WAITING':
      case 'PENDING':
        return <Clock size={20} />;
      default:
        return <Package size={20} />;
    }
  }

  function formatDateTime(dateString: string | undefined) {
    if (!dateString) return 'Não registrado';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function openViewModal(order: Order) {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
    setSelectedFile(null);
  }

  async function handleMarkAsWithdrawn(orderId: string) {
    if (!window.confirm('Confirmar retirada desta encomenda?')) return;

    try {
      await api.patch(`/orders/${orderId}/pickup`);
      
      // Recarregar encomendas
      const response = await api.get(`/users/${user?.id}/orders`);
      setOrders(response.data);
      
      // Atualizar encomenda selecionada
      const updatedOrder = response.data.find((o: Order) => o.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
      
      alert('Encomenda marcada como retirada!');
    } catch (error) {
      console.error('Erro ao marcar como retirada:', error);
      alert('Erro ao marcar encomenda como retirada.');
    }
  }

  async function handleMarkAsDelivered(orderId: string) {
    if (!selectedFile) {
      alert('Por favor, selecione uma foto de comprovação!');
      return;
    }

    if (!window.confirm('Confirmar entrega desta encomenda?')) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.patch(`/orders/${orderId}/deliver`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Recarregar encomendas
      const response = await api.get(`/users/${user?.id}/orders`);
      setOrders(response.data);
      
      // Fechar modal
      closeViewModal();
      
      alert('Encomenda marcada como entregue!');
    } catch (error) {
      console.error('Erro ao marcar como entregue:', error);
      alert('Erro ao marcar encomenda como entregue. Verifique se a foto foi anexada.');
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Apenas imagens JPG e PNG são permitidas!');
        return;
      }
      
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB!');
        return;
      }
      
      setSelectedFile(file);
    }
  }

  const pendingOrders = orders.filter(o => ['WAITING', 'PENDING'].includes(o.status));
  const withdrawnOrders = orders.filter(o => o.status === 'WITHDRAWN');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Minhas Entregas</h2>
          <p className="text-gray-600">Gerencie suas encomendas atribuídas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-700">{pendingOrders.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Em Trânsito</p>
                <p className="text-3xl font-bold text-blue-700">{withdrawnOrders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TruckIcon className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Entregues</p>
                <p className="text-3xl font-bold text-green-700">{deliveredOrders.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Encomendas */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma encomenda atribuída a você.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openViewModal(order)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getStatusStyles(order.status).replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{order.recipient.name}</h3>
                        <p className="text-sm text-gray-500">Código: {order.tracking_code}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {order.recipient.street}, {order.recipient.number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.recipient.city} - {order.recipient.state}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Criado em:</p>
                          <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusStyles(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Detalhes da Encomenda
              </h3>
              <button 
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Status e Código de Rastreamento */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusStyles(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                {getStatusLabel(selectedOrder.status)}
              </span>
              <span className="text-sm text-gray-500">
                Código: <span className="font-mono font-semibold">{selectedOrder.tracking_code}</span>
              </span>
            </div>

            {/* Destinatário */}
            <div className="border-t pt-4 mb-6">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <User size={18} />
                Destinatário
              </h4>
              <p className="text-gray-800 font-medium text-lg mb-2">{selectedOrder.recipient.name}</p>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <div>
                  <p>{selectedOrder.recipient.street}, {selectedOrder.recipient.number}</p>
                  {selectedOrder.recipient.complement && <p>{selectedOrder.recipient.complement}</p>}
                  <p>{selectedOrder.recipient.city} - {selectedOrder.recipient.state}</p>
                  <p className="font-mono">{selectedOrder.recipient.zipcode}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t pt-4 mb-6">
              <h4 className="font-bold text-gray-700 mb-4">Timeline da Entrega</h4>
              <div className="space-y-4">
                {/* Criado */}
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Package size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Encomenda Criada</p>
                    <p className="text-sm text-gray-500">{formatDateTime(selectedOrder.created_at)}</p>
                  </div>
                </div>

                {/* Retirado */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${selectedOrder.withdrawn_at ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <TruckIcon size={18} className={selectedOrder.withdrawn_at ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className={`font-medium ${selectedOrder.withdrawn_at ? 'text-gray-800' : 'text-gray-400'}`}>
                      Retirado para Entrega
                    </p>
                    <p className="text-sm text-gray-500">{formatDateTime(selectedOrder.withdrawn_at)}</p>
                  </div>
                </div>

                {/* Entregue */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${selectedOrder.delivered_at ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <CheckCircle size={18} className={selectedOrder.delivered_at ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className={`font-medium ${selectedOrder.delivered_at ? 'text-gray-800' : 'text-gray-400'}`}>
                      Encomenda Entregue
                    </p>
                    <p className="text-sm text-gray-500">{formatDateTime(selectedOrder.delivered_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto de Entrega (se existir) */}
            {selectedOrder.photo_url && (
              <div className="border-t pt-4 mb-6">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Camera size={18} />
                  Comprovante de Entrega
                </h4>
                <img 
                  src={selectedOrder.photo_url} 
                  alt="Comprovante de entrega" 
                  className="w-full max-w-md rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-4">
              {/* Botões de ação para o entregador */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                {selectedOrder.status === 'WAITING' && (
                  <button
                    onClick={() => handleMarkAsWithdrawn(selectedOrder.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <TruckIcon size={18} />
                    Retirar Encomenda
                  </button>
                )}
                
                {selectedOrder.status === 'WITHDRAWN' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {!selectedFile ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        <Camera size={18} />
                        Adicionar Foto
                      </button>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex-1">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm text-green-700 truncate">{selectedFile.name}</span>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleMarkAsDelivered(selectedOrder.id)}
                      disabled={!selectedFile}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={18} />
                      Confirmar Entrega
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={closeViewModal}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium w-full sm:w-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
