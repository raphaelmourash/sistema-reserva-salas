import { Link, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

export default function App() {
  const location = useLocation();
  
  // Verifica se estamos na rota raiz (que agora é o Login)
  const isLoginPage = location.pathname === '/';

  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* O cabeçalho com o menu SÓ APARECE se NÃO estiver na tela de login */}
      {!isLoginPage && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Sistema de Reserva de Salas</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Gerencie e reserve espaços de forma rápida e prática</p>
          </div>

          <nav style={{ display: 'flex', gap: '20px' }}>
            <Link to="/home" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Home</Link>
            <Link to="/usuarios" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Usuários</Link>
            <Link to="/" style={{ textDecoration: 'none', color: '#dc3545', fontWeight: 'bold' }}>Sair (Login)</Link>
          </nav>
        </header>
      )}

      {/* Área onde as rotas são renderizadas dinamicamente */}
      <main>
        <AppRoutes />
      </main>
      
    </div>
  );
}