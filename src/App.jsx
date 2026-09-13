import { Link } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

export default function App() {
  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Cabeçalho com o Menu de Navegação */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Sistema de Reserva de Salas</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Gerencie e reserve espaços de forma rápida e prática</p>
        </div>

        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Home</Link>
          <Link to="/usuarios" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Usuários</Link>
          <Link to="/login" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Login</Link>
        </nav>
      </header>

      {/* Área onde as rotas (Home, Usuários, Login) são renderizadas dinamicamente */}
      <main>
        <AppRoutes />
      </main>
      
    </div>
  );
}