import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignIn } from './pages/SignIn';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { CreateOrder } from './pages/NewOrder';
import { EditOrder } from './pages/EditOrder';
import { Orders } from './pages/Orders';
import { Recipients } from './pages/Recipients';
import { NewRecipient } from './pages/NewRecipient';
import { EditRecipient } from './pages/EditRecipient';
import { Deliverymen } from './pages/Deliverymen';
import { NewDeliveryman } from './pages/NewDeliveryman';
import { EditDeliveryman } from './pages/EditDeliveryman';
import { DeliverymanOrders } from './pages/DeliverymanOrders';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider> 
        <Routes>
          <Route path="/" element={<SignIn />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><Orders /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/new-order" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><CreateOrder /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><EditOrder /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/recipients" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><Recipients /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipients/new" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><NewRecipient /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipients/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><EditRecipient /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/deliverymen" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><Deliverymen /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/deliverymen/new" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><NewDeliveryman /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/deliverymen/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout><EditDeliveryman /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-orders" 
            element={
              <ProtectedRoute allowedRoles={['DELIVERYMAN']}>
                <Layout><DeliverymanOrders /></Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}