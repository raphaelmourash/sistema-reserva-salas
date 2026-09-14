import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import RoomFormModal from './RoomFormModal';
import { formatDateISO, formatTimeISO, formatDateBR } from './dateUtils';
import './Home.css';

const RESERVAS_STORAGE_KEY = 'reservasSalas';

const SALAS_INICIAIS = [
  {
    id: 1,
    nome: 'Sala Innovation',
    capacidade: '12 pessoas',
    tipo: 'Reunião',
    localizacao: 'Bloco A - 2º andar',
    status: 'Livre',
    recursos: ['TV 65"', 'Videoconferência', 'Projetor 4K'],
    imagem: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    nome: 'Sala Nexus',
    capacidade: '20 pessoas',
    tipo: 'Reunião',
    localizacao: 'Bloco B - 1º andar',
    status: 'Livre',
    recursos: ['Projetor', 'Wi-Fi Dedicado', 'Ar-condicionado'],
    imagem: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    nome: 'Sala Maker',
    capacidade: '16 pessoas',
    tipo: 'Laboratório',
    localizacao: 'Bloco C - Térreo',
    status: 'Livre',
    recursos: ['Impressora 3D', 'Quadro Branco', 'Mesas Modulares'],
    imagem: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    nome: 'Sala Executiva',
    capacidade: '8 pessoas',
    tipo: 'Reunião',
    localizacao: 'Bloco A - 3º andar',
    status: 'Livre',
    recursos: ['Mesa de Vidro', 'Smart TV', 'Cafeteira Exclusiva'],
    imagem: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    nome: 'Sala Auditório',
    capacidade: '80 pessoas',
    tipo: 'Apresentação',
    localizacao: 'Bloco Central - Térreo',
    status: 'Livre',
    recursos: ['Som Profissional', 'Telão de Projeção', 'Palco Modulável'],
    imagem: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    nome: 'Sala Colaborativa',
    capacidade: '10 pessoas',
    tipo: 'Trabalho em Grupo',
    localizacao: 'Bloco B - 2º andar',
    status: 'Livre',
    recursos: ['Sofás Confortáveis', 'Paredes de Vidro', 'Smart TV'],
    imagem: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
  }
];

const OPCOES_STATUS = [
  { label: 'Todas as salas', value: null },
  { label: 'Livres agora', value: 'Livre' },
  { label: 'Ocupadas agora', value: 'Reservada' },
];

function normalizarReservas(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const normalizado = {};
  for (const [salaId, valor] of Object.entries(raw)) {
    const lista = Array.isArray(valor) ? valor : valor && typeof valor === 'object' ? [valor] : [];
    normalizado[salaId] = lista.map((r, idx) => (r.id ? r : { ...r, id: `${salaId}-legacy-${idx}` }));
  }
  return normalizado;
}

// Verifica se a reserva expirou por falta de check-in após o tempo limite de tolerância (ex: 10 min)
function verificarReservasExpiradas(reservasMap, toleranciaMinutos = 10) {
  const agora = new Date();
  const hojeStr = formatDateISO(agora);
  const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
  let houveAlteracao = false;

  const novasReservas = {};

  for (const [salaId, lista] of Object.entries(reservasMap)) {
    novasReservas[salaId] = lista.map((r) => {
      // Se já foi feito check-in ou já está cancelada/expirada, não altera
      if (r.checkedIn || r.status === 'Cancelada' || r.status === 'Expirada') {
        return r;
      }

      // Se a data da reserva já passou e não teve check-in
      if (r.data < hojeStr) {
        houveAlteracao = true;
        return { ...r, status: 'Expirada' };
      }

      // Se é para hoje, valida se passou do horário de início + tolerância
      if (r.data === hojeStr && r.horarioInicio) {
        const [hInicio, mInicio] = r.horarioInicio.split(':').map(Number);
        const inicioMinutos = hInicio * 60 + mInicio;
        const limiteCheckInMinutos = inicioMinutos + toleranciaMinutos;

        if (horaAtualMinutos > limiteCheckInMinutos) {
          houveAlteracao = true;
          return { ...r, status: 'Expirada' };
        }
      }

      return r;
    });
  }

  return { novasReservas, houveAlteracao };
}

// Uma sala está ocupada agora se houver reserva ativa, dentro do horário e com check-in realizado (ou dentro do horário válido)
function estaOcupadaAgora(reservasDaSala) {
  if (!Array.isArray(reservasDaSala) || reservasDaSala.length === 0) return false;
  const agora = new Date();
  const hojeStr = formatDateISO(agora);
  const horaAtualStr = formatTimeISO(agora);

  return reservasDaSala.some(
    (r) => 
      r.data === hojeStr && 
      horaAtualStr >= r.horarioInicio && 
      horaAtualStr < r.horarioFim &&
      r.status !== 'Expirada' &&
      r.status !== 'Cancelada'
  );
}

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  return partes.length === 1
    ? partes[0].slice(0, 2).toUpperCase()
    : (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function Home() {
  const toast = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [salasBase] = useState(SALAS_INICIAIS);
  const [reservas, setReservas] = useState({});
  const [salaSelecionada, setSalaSelecionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  useEffect(() => {
    const salvasRaw = JSON.parse(localStorage.getItem(RESERVAS_STORAGE_KEY) || 'null');
    let dadosIniciais = {};

    if (salvasRaw) {
      dadosIniciais = normalizarReservas(salvasRaw);
    } else {
      const hoje = formatDateISO(new Date());
      dadosIniciais = {
        3: [
          {
            id: 'seed-sala-maker-hoje',
            salaId: 3,
            salaNome: 'Sala Maker',
            data: hoje,
            horarioInicio: '00:00',
            horarioFim: '23:59',
            responsavel: 'Equipe de Manutenção',
            finalidade: 'Reserva de demonstração (dia todo)',
            participantes: 1,
            criadoEm: new Date().toISOString(),
            checkedIn: false,
            status: 'Ativa'
          },
        ],
      };
    }

    // Executa a verificação de expiração logo na carga inicial
    const { novasReservas, houveAlteracao } = verificarReservasExpiradas(dadosIniciais);
    setReservas(novasReservas);
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(novasReservas));

    if (houveAlteracao) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Salas Liberadas',
        detail: 'Algumas reservas foram canceladas automaticamente por falta de check-in.',
        life: 5000,
      });
    }
  }, []);

  const [agoraTick, setAgoraTick] = useState(0);
  
  // A cada 1 minuto, checa se alguma reserva expirou por falta de check-in e atualiza o relógio
  useEffect(() => {
    const interval = setInterval(() => {
      setAgoraTick((t) => t + 1);
      
      setReservas((prevReservas) => {
        const { novasReservas, houveAlteracao } = verificarReservasExpiradas(prevReservas);
        if (houveAlteracao) {
          localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(novasReservas));
          toast.current?.show({
            severity: 'info',
            summary: 'Check-in expirado',
            detail: 'Uma reserva não teve check-in no prazo e a sala foi liberada.',
            life: 4000,
          });
        }
        return houveAlteracao ? novasReservas : prevReservas;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const salas = useMemo(
    () =>
      salasBase.map((sala) => ({
        ...sala,
        status: estaOcupadaAgora(reservas[sala.id]) ? 'Reservada' : 'Livre',
      })),
    [salasBase, reservas, agoraTick]
  );

  const opcoesTipo = useMemo(() => {
    const tipos = [...new Set(salasBase.map((s) => s.tipo))];
    return [{ label: 'Todos os tipos', value: null }, ...tipos.map((t) => ({ label: t, value: t }))];
  }, [salasBase]);

  const salasFiltradas = salas.filter((sala) => {
    const buscaOk = sala.nome.toLowerCase().includes(busca.trim().toLowerCase());
    const tipoOk = !filtroTipo || sala.tipo === filtroTipo;
    const statusOk = !filtroStatus || sala.status === filtroStatus;
    return buscaOk && tipoOk && statusOk;
  });

  const limparFiltros = () => {
    setBusca('');
    setFiltroTipo(null);
    setFiltroStatus(null);
  };

  const handleReservarClick = (sala) => {
    setSalaSelecionada(sala);
    setModalVisible(true);
  };

  const handleHideModal = () => {
    setModalVisible(false);
  };

  const handleConfirmarReserva = (payload) => {
    const payloadComCheckIn = { ...payload, checkedIn: false, status: 'Ativa' };
    setReservas((prev) => {
      const atualizadas = {
        ...prev,
        [payload.salaId]: [...(prev[payload.salaId] || []), payloadComCheckIn],
      };
      localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(atualizadas));
      return atualizadas;
    });

    toast.current?.show({
      severity: 'success',
      summary: 'Reserva confirmada',
      detail: `${payload.salaNome} · ${formatDateBR(payload.data)} das ${payload.horarioInicio} às ${payload.horarioFim}`,
      life: 4500,
    });
    setModalVisible(false);
  };

  const handleCancelarReserva = (reserva) => {
    setReservas((prev) => {
      const atualizadas = {
        ...prev,
        [reserva.salaId]: (prev[reserva.salaId] || []).filter((r) => r.id !== reserva.id),
      };
      localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(atualizadas));
      return atualizadas;
    });

    toast.current?.show({
      severity: 'info',
      summary: 'Reserva cancelada',
      detail: `${reserva.salaNome} · ${formatDateBR(reserva.data)} das ${reserva.horarioInicio} às ${reserva.horarioFim}`,
      life: 4000,
    });
  };

  const handleEditarReserva = (payloadAtualizado) => {
    setReservas((prev) => {
      const atualizadas = {
        ...prev,
        [payloadAtualizado.salaId]: (prev[payloadAtualizado.salaId] || []).map((r) =>
          r.id === payloadAtualizado.id ? payloadAtualizado : r
        ),
      };
      localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(atualizadas));
      return atualizadas;
    });

    toast.current?.show({
      severity: 'success',
      summary: 'Check-in realizado com sucesso!',
      detail: `${payloadAtualizado.salaNome} liberada para uso.`,
      life: 4500,
    });
    setModalVisible(false);
  };

  return (
    <div className="home-page">
      <Toast ref={toast} />

      <div className="home-welcome">
        <Avatar
          label={usuario ? iniciais(usuario.name) : undefined}
          icon={usuario ? undefined : 'pi pi-user'}
          size="large"
          shape="circle"
          style={{ backgroundColor: 'var(--primary-color, #6366f1)', color: '#fff', flexShrink: 0 }}
        />
        <div className="home-welcome-text">
          <h2>Painel de Salas {usuario ? `- Bem-vindo(a), ${usuario.name}!` : ''}</h2>
          <p>Consulte a disponibilidade de espaços, verifique os recursos tecnológicos e faça suas reservas.</p>
        </div>
      </div>

      <div className="home-toolbar">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar sala pelo nome..."
          />
        </span>
        <Dropdown
          value={filtroTipo}
          options={opcoesTipo}
          onChange={(e) => setFiltroTipo(e.value)}
          placeholder="Tipo de ambiente"
        />
        <Dropdown
          value={filtroStatus}
          options={OPCOES_STATUS}
          onChange={(e) => setFiltroStatus(e.value)}
          placeholder="Disponibilidade"
        />
      </div>

      <div className="home-section-header">
        <h3 className="home-section-title">Espaços Disponíveis para Reserva</h3>
        <span className="home-section-count">
          {salasFiltradas.length} de {salas.length} salas
        </span>
      </div>
      <Divider style={{ marginTop: '10px', marginBottom: '22px' }} />

      {salasFiltradas.length === 0 ? (
        <div className="home-empty-state">
          <i className="pi pi-search-minus" />
          <p>Nenhuma sala encontrada com esses filtros.</p>
          <Button label="Limpar filtros" text onClick={limparFiltros} />
        </div>
      ) : (
        <div className="home-grid">
          {salasFiltradas.map((sala) => {
            const cardHeader = (
              <div className="room-card-media">
                <img alt={sala.nome} src={sala.imagem} />
                <Tag
                  className="room-card-status"
                  value={sala.status === 'Livre' ? 'Livre agora' : 'Ocupada agora'}
                  severity={sala.status === 'Livre' ? 'success' : 'danger'}
                />
              </div>
            );

            const cardFooter = (
              <Button
                label="Reservar Sala"
                icon="pi pi-calendar-plus"
                className="p-button-primary"
                style={{ width: '100%' }}
                onClick={() => handleReservarClick(sala)}
              />
            );

            return (
              <Card key={sala.id} className="room-card" header={cardHeader} footer={cardFooter}>
                <h4 className="room-card-title">{sala.nome}</h4>

                <div className="room-card-meta">
                  <div><i className="pi pi-users" /><strong>Capacidade:</strong> {sala.capacidade}</div>
                  <div><i className="pi pi-map-marker" /><strong>Local:</strong> {sala.localizacao}</div>
                </div>

                <div className="room-card-chips">
                  {sala.recursos.map((r) => (
                    <Chip key={r} label={r} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <RoomFormModal
        visible={modalVisible}
        room={salaSelecionada}
        currentUser={usuario}
        reservasExistentes={salaSelecionada ? reservas[salaSelecionada.id] || [] : []}
        onHide={handleHideModal}
        onConfirm={handleConfirmarReserva}
        onCancelarReserva={handleCancelarReserva}
        onEditarReserva={handleEditarReserva}
      />
    </div>
  );
}