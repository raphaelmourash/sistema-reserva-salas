import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import UsuariosCadastrados from '../pages/Usuarios'; 

export default function AppRoutes() {
  return (
    <Routes>
      {/* A página inicial (raiz) agora é o Login */}
      <Route path="/" element={<Login />} />
      
      {/* A Home de reservas fica protegida/acessível após o login */}
      <Route path="/home" element={<Home />} />
      
      {/* Rota para gerenciar usuários cadastrados */}
      <Route path="/usuarios" element={<UsuariosCadastrados />} />
      
      {/* Página 404 para rotas inválidas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}