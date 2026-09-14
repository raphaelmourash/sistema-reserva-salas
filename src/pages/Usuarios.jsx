import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

export default function UsuariosCadastrados() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consumindo a API gratuita de usuários do JSONPlaceholder
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar usuários:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <ProgressSpinner />
        <p>Carregando usuários cadastrados...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Usuários Cadastrados no Sistema</h2>
      

      <div className="card" style={{ background: '#fff', borderRadius: '8px', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <DataTable value={usuarios} paginator rows={5} stripedRows tableStyle={{ minWidth: '50rem' }}>
          <Column field="name" header="Nome Completo" sortable />
          <Column field="username" header="Nome de Usuário" sortable />
          <Column field="email" header="E-mail" sortable />
          <Column field="phone" header="Telefone" />
          <Column 
            header="Status" 
            body={() => <Tag value="Ativo" severity="success" />} 
            style={{ textAlign: 'center' }} 
          />
        </DataTable>
      </div>
    </div>
  );
}