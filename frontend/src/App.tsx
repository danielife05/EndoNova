import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import OdontogramaPage from './pages/OdontogramaPage';
import FichaPage from './pages/FichaPage';
import PagosPage from './pages/PagosPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial es el Login */}
        <Route path="/" element={<Login />} />
        
        {/* Dashboard - Nueva página principal después del login */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Ruta para la gestión de pacientes */}
        <Route path="/pacientes" element={<Pacientes />} />
        
        {/* Rutas para vistas de paciente específico */}
        <Route path="/pacientes/:idPaciente/odontograma" element={<OdontogramaPage />} />
        <Route path="/pacientes/:idPaciente/ficha" element={<FichaPage />} />
        <Route path="/pacientes/:idPaciente/ficha/:idFicha/pagos" element={<PagosPage />} />
        <Route path="/pacientes/:idPaciente/pagos" element={<PagosPage />} />
        
        {/* Redirigir rutas desconocidas al login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
