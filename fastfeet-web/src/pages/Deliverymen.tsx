import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Package
} from 'lucide-react';
import { api } from '../lib/axios';

interface Deliveryman {
  id: string;
  name: string;
  cpf: string;
  role: string;
}

export function Deliverymen() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deliverymen, setDeliverymen] = useState<Deliveryman[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deliverymanToDelete, setDeliverymanToDelete] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDeliveryman, setSelectedDeliveryman] = useState<Deliveryman | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadDeliverymen();
  }, []);

  async function loadDeliverymen() {
    try {
      const response = await api.get('/deliverymen');
      setDeliverymen(response.data);
      
      // Carregar estatísticas de entregas
      const stats: Record<string, number> = {};
      for (const deliveryman of response.data) {
        try {
          const ordersResponse = await api.get(`/users/${deliveryman.id}/orders`);
          stats[deliveryman.id] = ordersResponse.data.length || 0;
        } catch {
          stats[deliveryman.id] = 0;
        }
      }
      setDeliveryStats(stats);
    } catch (err) {
      console.error('Erro ao buscar entregadores:', err);
    }
  }

  const filteredDeliverymen = deliverymen.filter(deliveryman =>
    deliveryman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deliveryman.cpf.includes(searchTerm)
  );

  function openDeleteModal(deliverymanId: string) {
    setDeliverymanToDelete(deliverymanId);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setDeliverymanToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!deliverymanToDelete) return;

    try {
      await api.delete(`/users/${deliverymanToDelete}`);
      setDeliverymen(deliverymen.filter(d => d.id !== deliverymanToDelete));
      closeDeleteModal();
      alert('Entregador excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir entregador:', error);
      alert('Erro ao excluir entregador. Pode haver encomendas vinculadas a ele.');
    }
  }

  function openViewModal(deliveryman: Deliveryman) {
    setSelectedDeliveryman(deliveryman);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setIsViewModalOpen(false);
    setSelectedDeliveryman(null);
  }

  function handleEdit(deliverymanId: string) {
    navigate(`/deliverymen/edit/${deliverymanId}`);
  }

  function formatCPF(cpf: string) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Entregadores</h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou CPF"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/deliverymen/new"
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors w-full sm:w-auto shadow-md shadow-purple-200"
          >
            <Plus size={20} className="mr-2" />
            NOVO ENTREGADOR
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entregador</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">CPF</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entregas</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeliverymen.map((deliveryman) => (
                  <tr key={deliveryman.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${deliveryman.name}&background=random&color=fff`}
                          alt={deliveryman.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{deliveryman.name}</p>
                          <p className="text-xs text-gray-500">ID: {deliveryman.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-gray-600 font-mono">
                      {formatCPF(deliveryman.cpf)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {deliveryStats[deliveryman.id] || 0} encomenda(s)
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openViewModal(deliveryman)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(deliveryman.id)}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(deliveryman.id)}
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
          
          {filteredDeliverymen.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhum entregador encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedDeliveryman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Detalhes do Entregador
              </h3>
              <button 
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${selectedDeliveryman.name}&background=random&color=fff&size=80`}
                  alt={selectedDeliveryman.name}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedDeliveryman.name}</h4>
                  <p className="text-sm text-gray-500">Entregador</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">CPF</label>
                    <p className="text-gray-800 font-mono">{formatCPF(selectedDeliveryman.cpf)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">ID</label>
                    <p className="text-gray-800 font-mono text-xs">{selectedDeliveryman.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Total de Entregas</label>
                    <p className="text-gray-800 font-semibold">{deliveryStats[selectedDeliveryman.id] || 0} encomenda(s)</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Função</label>
                    <p className="text-gray-800">Entregador</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeViewModal}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
              Tem certeza que deseja excluir este entregador? Esta ação não pode ser desfeita.
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
