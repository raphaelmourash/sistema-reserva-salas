import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '72px', color: '#dc3545', margin: '0' }}>404</h1>
      <h2>Página não encontrada</h2>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>A página que você está procurando não existe ou foi movida.</p>
      <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        Voltar para o Início
      </Link>
    </div>
  );
}