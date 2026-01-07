import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  TruckIcon
} from 'lucide-react';
import { api } from '../lib/axios';

type OrderStatus = 'WAITING' | 'PENDING' | 'WITHDRAWN' | 'DELIVERED' | 'RETURNED';

interface Order {
  id: string;
  recipient: {
    name: string;
    city: string;
    state: string;
  };
  deliveryman: {
    name: string;
    avatar_url: string | null;
  };
  status: OrderStatus;
  tracking_code: string;
  created_at: string;
  withdrawn_at?: string;
  delivered_at?: string;
  photo_url?: string;
}

export function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    api
      .get('/orders')
      .then((response) => {
        setOrders(response.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar encomendas:', err);
      });
  }, []);

  const filteredOrders = orders.filter(order =>
    order.recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openDeleteModal(orderId: string) {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!orderToDelete) return;

    try {
      await api.delete(`/orders/${orderToDelete}`);
      setOrders(orders.filter(order => order.id !== orderToDelete));
      closeDeleteModal();
      alert('Encomenda excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir encomenda:', error);
      alert('Erro ao excluir encomenda. Tente novamente.');
    }
  }

  function openViewModal(order: Order) {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  }

  function handleEdit(orderId: string) {
    navigate(`/orders/edit/${orderId}`);
  }

  async function handleQuickStatusChange(orderId: string, action: 'withdrawn' | 'delivered' | 'canceled') {
    try {
      await api.patch(`/orders/${orderId}/status/${action}`);
      
      // Atualizar a lista de encomendas
      const response = await api.get('/orders');
      setOrders(response.data);
      
      // Atualizar a encomenda selecionada no modal
      const updatedOrder = response.data.find((o: Order) => o.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
      
      const messages = {
        withdrawn: 'Encomenda marcada como retirada!',
        delivered: 'Encomenda marcada como entregue!',
        canceled: 'Encomenda devolvida!'
      };
      
      alert(messages[action]);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da encomenda.');
    }
  }

  function getStatusStyles(status: OrderStatus) {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'WAITING':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'WITHDRAWN':
        return 'bg-blue-100 text-blue-700';
      case 'RETURNED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  function formatDateTime(dateString: string | undefined) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Encomendas</h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por encomendas"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/new-order"
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors w-full sm:w-auto shadow-md shadow-purple-200"
          >
            <Plus size={20} className="mr-2" />
            NOVA ENCOMENDA
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Destinatário</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entregador</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade/UF</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 font-mono">{order.tracking_code}</td>
                    <td className="p-4 text-sm font-medium text-gray-800">{order.recipient.name}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${order.deliveryman.name}&background=random&color=fff`}
                          alt={order.deliveryman.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{order.deliveryman.name}</span>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {order.recipient.city} - {order.recipient.state}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-2 ${getStatusStyles(order.status)}`}>
                        <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                        {getStatusLabel(order.status).toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openViewModal(order)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(order.id)}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(order.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhuma encomenda encontrada com esse nome.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Detalhes da Encomenda
              </h3>
              <button 
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Código de Rastreio</label>
                  <p className="text-gray-800 font-mono">{selectedOrder.tracking_code}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-2 ${getStatusStyles(selectedOrder.status)}`}>
                      <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                      {getStatusLabel(selectedOrder.status).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline de Status */}
              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-4">Timeline da Entrega</h4>
                <div className="space-y-4">
                  
                  {/* Criado */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Package className="text-purple-600" size={20} />
                      </div>
                      {(selectedOrder.withdrawn_at || selectedOrder.status === 'WITHDRAWN' || selectedOrder.delivered_at || selectedOrder.status === 'DELIVERED') && (
                        <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-800">Encomenda Criada</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(selectedOrder.created_at) || 'Data não disponível'}
                      </p>
                    </div>
                  </div>

                  {/* Retirado */}
                  {(selectedOrder.withdrawn_at || selectedOrder.status === 'WITHDRAWN' || selectedOrder.status === 'DELIVERED') && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <TruckIcon className="text-blue-600" size={20} />
                        </div>
                        {(selectedOrder.delivered_at || selectedOrder.status === 'DELIVERED') && (
                          <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-gray-800">Retirada pelo Entregador</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(selectedOrder.withdrawn_at) || 'Data não registrada'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Entregue */}
                  {(selectedOrder.delivered_at || selectedOrder.status === 'DELIVERED') && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="text-green-600" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Entregue</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(selectedOrder.delivered_at) || 'Data não registrada'}
                        </p>
                        {selectedOrder.photo_url && (
                          <p className="text-xs text-gray-400 mt-1">
                            📷 Foto de comprovação anexada
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aguardando Retirada - Só mostra se ainda não foi retirado */}
                  {!selectedOrder.withdrawn_at && selectedOrder.status !== 'WITHDRAWN' && selectedOrder.status !== 'DELIVERED' && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Clock className="text-gray-400" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-400">Aguardando Retirada</p>
                        <p className="text-sm text-gray-400">
                          Pendente
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Aguardando Entrega - Só mostra se foi retirado mas não entregue */}
                  {(selectedOrder.withdrawn_at || selectedOrder.status === 'WITHDRAWN') && !selectedOrder.delivered_at && selectedOrder.status !== 'DELIVERED' && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Clock className="text-gray-400" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-400">Aguardando Entrega</p>
                        <p className="text-sm text-gray-400">
                          Em trânsito
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-3">Destinatário</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Nome</label>
                    <p className="text-gray-800">{selectedOrder.recipient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Cidade/Estado</label>
                    <p className="text-gray-800">{selectedOrder.recipient.city} - {selectedOrder.recipient.state}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-3">Entregador</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${selectedOrder.deliveryman.name}&background=random&color=fff`}
                    alt={selectedOrder.deliveryman.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Nome</label>
                    <p className="text-gray-800">{selectedOrder.deliveryman.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 gap-3 border-t pt-4">
              {/* Botões de ação rápida baseados no status */}
              <div className="flex gap-2">
                {selectedOrder.status === 'WAITING' && (
                  <button
                    onClick={() => handleQuickStatusChange(selectedOrder.id, 'withdrawn')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <TruckIcon size={16} />
                    Marcar como Retirada
                  </button>
                )}
                {selectedOrder.status === 'WITHDRAWN' && (
                  <button
                    onClick={() => handleQuickStatusChange(selectedOrder.id, 'delivered')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <CheckCircle size={16} />
                    Marcar como Entregue
                  </button>
                )}
                {selectedOrder.status !== 'RETURNED' && selectedOrder.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleQuickStatusChange(selectedOrder.id, 'canceled')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Devolver Encomenda
                  </button>
                )}
              </div>
              
              <button
                onClick={closeViewModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta encomenda? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}