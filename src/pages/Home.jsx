import { useState } from 'react';

export default function Home() {
  const [rooms] = useState([
    {
      id: 1,
      name: 'Sala de Reunião Executiva',
      capacity: 10,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      description: 'Espaço moderno com projetor 4K e mesa de vidro para grandes reuniões.'
    },
    {
      id: 2,
      name: 'Sala de Brainstorming Criativo',
      capacity: 6,
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
      description: 'Ambiente descontraído com paredes de vidro para escrita e sofás confortáveis.'
    },
    {
      id: 3,
      name: 'Auditório de Treinamento',
      capacity: 30,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
      description: 'Espaço amplo ideal para palestras, workshops e treinamentos corporativos.'
    }
  ]);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Salas Disponíveis</h2>
      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {rooms.map(room => (
          <div key={room.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#fff' }}>
            <img src={room.image} alt={room.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <h3>{room.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>Capacidade: {room.capacity} pessoas</p>
              <p style={{ fontSize: '14px' }}>{room.description}</p>
              <button 
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '10px' }}
                onClick={() => alert(`Reservar a ${room.name}`)}
              >
                Reservar Sala
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}