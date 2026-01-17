import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
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
        
        {/* Ruta para la gestión de pacientes */}
        <Route path="/pacientes" element={<Pacientes />} />
        
        {/* Rutas para vistas de paciente específico */}
        <Route path="/pacientes/:idPaciente/odontograma" element={<OdontogramaPage />} />
        <Route path="/pacientes/:idPaciente/ficha" element={<FichaPage />} />
        <Route path="/pacientes/:idPaciente/ficha/:idFicha/pagos" element={<PagosPage />} />
        <Route path="/pacientes/:idPaciente/pagos" element={<PagosPage />} />
      </Routes>
    </Router>
  );
}

export default App;