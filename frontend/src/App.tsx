// No need to import React explicitly for JSX in modern Vite
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { VotingPage } from './pages/VotingPage';
import { AdminDashboard } from './components/AdminDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const role = localStorage.getItem('role');
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <VotingPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
