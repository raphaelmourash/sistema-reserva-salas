import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function RoomFormModal({ visible, onHide, roomData, onChange, onSave }) {
  return (
    <Dialog 
      header="Gerenciar Espaço / Sala" 
      visible={visible} 
      style={{ width: '450px' }} 
      onHide={onHide}
      modal
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome da Sala</label>
          <InputText 
            value={roomData.name} 
            onChange={(e) => onChange('name', e.target.value)} 
            placeholder="Ex: Sala de Reunião Alpha" 
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Capacidade (Pessoas)</label>
          <InputText 
            type="number"
            value={roomData.capacity} 
            onChange={(e) => onChange('capacity', e.target.value)} 
            placeholder="Ex: 10" 
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descrição</label>
          <InputText 
            value={roomData.description} 
            onChange={(e) => onChange('description', e.target.value)} 
            placeholder="Breve descrição dos equipamentos" 
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" onClick={onHide} text />
          <Button label="Salvar Sala" icon="pi pi-check" onClick={onSave} />
        </div>
      </div>
    </Dialog>
  );
}