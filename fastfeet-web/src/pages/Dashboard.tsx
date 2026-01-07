import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  tracking_code: string;
  status: "WAITING" | "WITHDRAWN" | "DELIVERED" | "RETURNED";
  created_at: string;
  delivered_at?: string;
  recipient: {
    name: string;
    city: string;
    state: string;
  };
  deliveryman?: {
    name: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  withdrawn: number;
  delivered: number;
  deliveredToday: number;
  returned: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    withdrawn: 0,
    delivered: 0,
    deliveredToday: 0,
    returned: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    api
      .get("/orders")
      .then((response) => {
        const ordersData: Order[] = response.data;
        setOrders(ordersData);

        // Calcular estatísticas
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const statistics: Stats = {
          total: ordersData.length,
          pending: ordersData.filter((o) => o.status === "WAITING").length,
          withdrawn: ordersData.filter((o) => o.status === "WITHDRAWN").length,
          delivered: ordersData.filter((o) => o.status === "DELIVERED").length,
          deliveredToday: ordersData.filter((o) => {
            if (o.status === "DELIVERED" && o.delivered_at) {
              const deliveredDate = new Date(o.delivered_at);
              deliveredDate.setHours(0, 0, 0, 0);
              return deliveredDate.getTime() === today.getTime();
            }
            return false;
          }).length,
          returned: ordersData.filter((o) => o.status === "RETURNED").length,
        };

        setStats(statistics);
      })
      .catch((err) => {
        console.error("Erro ao buscar encomendas:", err);
        alert("Erro ao carregar dados. Você é Admin?");
      });
  }, [isAuthenticated]);

  return (
    <div className="h-screen w-screen bg-gray-100 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-brand-purple">
            Dashboard FastFeet 🚚
          </h1>
          <button
            onClick={signOut}
            className="text-red-500 font-semibold hover:text-red-700 transition-colors"
          >
            Sair do sistema
          </button>
        </header>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Encomendas */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-brand-purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Total de Encomendas
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.total}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          {/* Encomendas Pendentes */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Pendentes
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.pending}
                </h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Aguardando retirada</p>
          </div>

          {/* Encomendas em Trânsito */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Em Trânsito
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.withdrawn}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Retiradas pelos entregadores</p>
          </div>

          {/* Entregues Hoje */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Entregues Hoje
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.deliveredToday}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total entregues: {stats.delivered}
            </p>
          </div>
        </div>

        {/* Gráfico de Status - Visual Simples */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Distribuição por Status
          </h2>
          <div className="space-y-4">
            {/* Aguardando */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Aguardando ({stats.pending})
                </span>
                <span className="text-sm text-gray-500">
                  {stats.total > 0
                    ? ((stats.pending / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Em Trânsito */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Em Trânsito ({stats.withdrawn})
                </span>
                <span className="text-sm text-gray-500">
                  {stats.total > 0
                    ? ((stats.withdrawn / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? (stats.withdrawn / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Entregues */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Entregues ({stats.delivered})
                </span>
                <span className="text-sm text-gray-500">
                  {stats.total > 0
                    ? ((stats.delivered / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Devolvidas */}
            {stats.returned > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Devolvidas ({stats.returned})
                  </span>
                  <span className="text-sm text-gray-500">
                    {stats.total > 0
                      ? ((stats.returned / stats.total) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${stats.total > 0 ? (stats.returned / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Encomendas Recentes */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Encomendas Recentes
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="text-brand-purple font-semibold hover:text-violet-600 transition text-sm"
              >
                Ver todas
              </button>
              <button
                onClick={() => navigate("/new-order")}
                className="bg-brand-purple text-white px-4 py-2 rounded font-bold text-sm hover:bg-violet-600 transition"
              >
                + Nova Encomenda
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="p-4">Código</th>
                <th className="p-4">Destinatário</th>
                <th className="p-4">Entregador</th>
                <th className="p-4">Cidade/UF</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 text-gray-700 cursor-pointer"
                  onClick={() => navigate(`/orders`)}
                >
                  <td className="p-4 font-mono text-xs">
                    {order.tracking_code}
                  </td>
                  <td className="p-4">{order.recipient?.name}</td>
                  <td className="p-4">
                    {order.deliveryman ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center text-xs font-bold">
                          {order.deliveryman.name.charAt(0)}
                        </div>
                        {order.deliveryman.name}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Sem entregador</span>
                    )}
                  </td>
                  <td className="p-4">
                    {order.recipient?.city} - {order.recipient?.state}
                  </td>
                  <td className="p-4">
                    <span
                      className={`
                      px-3 py-1 rounded-full text-xs font-bold
                      ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        order.status === "WAITING"
                          ? "bg-yellow-100 text-yellow-700"
                          : ""
                      }
                      ${
                        order.status === "WITHDRAWN"
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }
                      ${
                        order.status === "RETURNED"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                    `}
                    >
                      {order.status === "WAITING" && "Aguardando"}
                      {order.status === "WITHDRAWN" && "Em trânsito"}
                      {order.status === "DELIVERED" && "Entregue"}
                      {order.status === "RETURNED" && "Devolvida"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">📭</p>
              <p>Nenhuma encomenda cadastrada ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
