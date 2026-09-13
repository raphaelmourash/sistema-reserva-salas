import { Routes, Route } from 'react-router-dom'; // <-- Adicione esta linha!
import Home from '../pages/Home';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
// Ajuste o caminho abaixo conforme onde o seu componente de usuários está salvo:
import UsuariosCadastrados from '../pages/Usuarios'; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/usuarios" element={<UsuariosCadastrados />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}