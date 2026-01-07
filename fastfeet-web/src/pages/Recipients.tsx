import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin
} from 'lucide-react';
import { api } from '../lib/axios';

interface Recipient {
  id: string;
  name: string;
  street: string;
  number: number;
  complement?: string;
  city: string;
  state: string;
  zipcode: string;
}

export function Recipients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  useEffect(() => {
    api
      .get('/recipients')
      .then((response) => {
        setRecipients(response.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar destinatários:', err);
      });
  }, []);

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openDeleteModal(recipientId: string) {
    setRecipientToDelete(recipientId);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setRecipientToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!recipientToDelete) return;

    try {
      await api.delete(`/recipients/${recipientToDelete}`);
      setRecipients(recipients.filter(recipient => recipient.id !== recipientToDelete));
      closeDeleteModal();
      alert('Destinatário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir destinatário:', error);
      alert('Erro ao excluir destinatário. Tente novamente.');
    }
  }

  function openViewModal(recipient: Recipient) {
    setSelectedRecipient(recipient);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setIsViewModalOpen(false);
    setSelectedRecipient(null);
  }

  function handleEdit(recipientId: string) {
    navigate(`/recipients/edit/${recipientId}`);
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Destinatários</h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por destinatários"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/recipients/new"
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors w-full sm:w-auto shadow-md shadow-purple-200"
          >
            <Plus size={20} className="mr-2" />
            NOVO DESTINATÁRIO
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Endereço</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade/UF</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">CEP</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-800">{recipient.name}</td>
                    
                    <td className="p-4 text-sm text-gray-600">
                      {recipient.street}, {recipient.number}
                      {recipient.complement && ` - ${recipient.complement}`}
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {recipient.city} - {recipient.state}
                      </div>
                    </td>

                    <td className="p-4 text-sm text-gray-600 font-mono">
                      {recipient.zipcode}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openViewModal(recipient)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(recipient.id)}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(recipient.id)}
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
          
          {filteredRecipients.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhum destinatário encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Detalhes do Destinatário
              </h3>
              <button 
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-500">Nome</label>
                <p className="text-gray-800 font-medium text-lg">{selectedRecipient.name}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-3">Endereço</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Rua</label>
                    <p className="text-gray-800">{selectedRecipient.street}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Número</label>
                    <p className="text-gray-800">{selectedRecipient.number}</p>
                  </div>
                  {selectedRecipient.complement && (
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-500">Complemento</label>
                      <p className="text-gray-800">{selectedRecipient.complement}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Cidade</label>
                    <p className="text-gray-800">{selectedRecipient.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Estado</label>
                    <p className="text-gray-800">{selectedRecipient.state}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-500">CEP</label>
                    <p className="text-gray-800 font-mono">{selectedRecipient.zipcode}</p>
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
              Tem certeza que deseja excluir este destinatário? Esta ação não pode ser desfeita.
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
