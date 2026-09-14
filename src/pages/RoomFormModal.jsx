import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { classNames } from "primereact/utils";
import {
  formatDateISO,
  formatTimeISO,
  formatDateBR,
  horariosSeSobrepoem,
  parseTimeISO,
  parseDateISO,
  pad2,
} from "./dateUtils";
import "./RoomFormModal.css";

// Janela de horário de funcionamento exibida na grade de disponibilidade.
// Ajuste aqui se o expediente da empresa for diferente.
const HORARIO_ABERTURA = "07:00";
const HORARIO_FECHAMENTO = "22:00";
const DURACAO_SLOT_MIN = 30;

function gerarSlotsDoDia(abertura, fechamento, duracaoMin) {
  const [hAbre, mAbre] = abertura.split(":").map(Number);
  const [hFecha, mFecha] = fechamento.split(":").map(Number);
  const fimTotalMin = hFecha * 60 + mFecha;
  const slots = [];
  let atualMin = hAbre * 60 + mAbre;
  while (atualMin + duracaoMin <= fimTotalMin) {
    const fimMin = atualMin + duracaoMin;
    slots.push({
      inicio: `${pad2(Math.floor(atualMin / 60))}:${pad2(atualMin % 60)}`,
      fim: `${pad2(Math.floor(fimMin / 60))}:${pad2(fimMin % 60)}`,
    });
    atualMin = fimMin;
  }
  return slots;
}

const SLOTS_DIA = gerarSlotsDoDia(HORARIO_ABERTURA, HORARIO_FECHAMENTO, DURACAO_SLOT_MIN);

// Id único por reserva — usa crypto.randomUUID() quando disponível, com
// fallback simples pra navegadores/ambientes mais antigos.
function gerarIdReserva() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * RoomFormModal
 * -------------------------------------------------------------------------
 * Modal de agendamento de salas. Recebe a sala selecionada no catálogo
 * (mesmo formato de objeto usado em Home.jsx) e devolve, via onConfirm,
 * o payload da reserva pronto para ser gravado no estado/persistência
 * da aplicação.
 */
export default function RoomFormModal({
  visible,
  onHide,
  room,
  onConfirm,
  currentUser,
  reservasExistentes = [],
  onCancelarReserva,
  onEditarReserva,
}) {
  const emptyForm = {
    data: null,
    horarioInicio: null,
    horarioFim: null,
    responsavel: "",
    finalidade: "",
    participantes: null,
  };

  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const formVazioComResponsavel = () => {
    const storedUser = currentUser || JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    return { ...emptyForm, responsavel: storedUser?.name || storedUser?.email || "" };
  };

  // A capacidade vem como texto ("12 pessoas"); extraímos o número pra validar
  const capacidadeNumerica = useMemo(() => {
    if (!room) return null;
    const match = String(room.capacidade).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }, [room]);

  // Preenche o responsável automaticamente a partir do usuário logado
  useEffect(() => {
    if (visible) {
      setForm(formVazioComResponsavel());
      setEditandoId(null);
      setTouched({});
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, room]);

  const handleEditarClick = (reserva) => {
    setEditandoId(reserva.id);
    setForm({
      data: parseDateISO(reserva.data),
      horarioInicio: parseTimeISO(reserva.horarioInicio),
      horarioFim: parseTimeISO(reserva.horarioFim),
      responsavel: reserva.responsavel,
      finalidade: reserva.finalidade,
      participantes: reserva.participantes,
    });
    setTouched({});
  };

  const handleCancelarEdicao = () => {
    setForm(formVazioComResponsavel());
    setEditandoId(null);
    setTouched({});
  };

  const proximasReservas = useMemo(() => {
    const hojeStr = formatDateISO(new Date());
    return [...reservasExistentes]
      .filter((r) => r.data >= hojeStr)
      .sort((a, b) => (a.data + a.horarioInicio).localeCompare(b.data + b.horarioInicio))
      .slice(0, 10);
  }, [reservasExistentes]);

  const handleCancelarClick = (event, reserva) => {
    confirmPopup({
      target: event.currentTarget,
      message: `Cancelar a reserva de ${reserva.responsavel} em ${formatDateBR(reserva.data)} (${reserva.horarioInicio}–${reserva.horarioFim})?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Cancelar reserva",
      rejectLabel: "Voltar",
      acceptClassName: "p-button-danger p-button-sm",
      rejectClassName: "p-button-text p-button-sm",
      accept: () => onCancelarReserva?.(reserva),
    });
  };

  const reservasNoDia = useMemo(() => {
    const dataStr = formatDateISO(form.data);
    if (!dataStr) return [];
    return reservasExistentes
      .filter((r) => r.data === dataStr && r.id !== editandoId)
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }, [form.data, reservasExistentes, editandoId]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.data) e.data = "Selecione a data da reserva.";
    if (!form.horarioInicio) e.horarioInicio = "Informe o horário de início.";
    if (!form.horarioFim) e.horarioFim = "Informe o horário de término.";
    if (form.horarioInicio && form.horarioFim && form.horarioFim <= form.horarioInicio) {
      e.horarioFim = "O horário final deve ser depois do início.";
    }
    if (!form.responsavel?.trim()) e.responsavel = "Informe o responsável pela reserva.";
    if (!form.finalidade?.trim()) e.finalidade = "Descreva a finalidade da reserva.";
    if (!form.participantes || form.participantes < 1) {
      e.participantes = "Informe o número de participantes.";
    } else if (capacidadeNumerica && form.participantes > capacidadeNumerica) {
      e.participantes = `Excede a capacidade da sala (máx. ${capacidadeNumerica}).`;
    }

    if (!e.horarioInicio && !e.horarioFim && form.horarioInicio && form.horarioFim) {
      const inicioStr = formatTimeISO(form.horarioInicio);
      const fimStr = formatTimeISO(form.horarioFim);
      const conflito = reservasNoDia.find((r) =>
        horariosSeSobrepoem(inicioStr, fimStr, r.horarioInicio, r.horarioFim)
      );
      if (conflito) {
        e.horarioFim = `Conflita com a reserva de ${conflito.responsavel} (${conflito.horarioInicio}–${conflito.horarioFim}).`;
      }
    }

    return e;
  }, [form, capacidadeNumerica, reservasNoDia]);

  const isValid = Object.keys(errors).length === 0;

  const slotsComStatus = useMemo(() => {
    if (!form.data) return [];
    return SLOTS_DIA.map((slot) => {
      const conflitante = reservasNoDia.find((r) =>
        horariosSeSobrepoem(slot.inicio, slot.fim, r.horarioInicio, r.horarioFim)
      );
      return { ...slot, ocupado: Boolean(conflitante), responsavel: conflitante?.responsavel };
    });
  }, [form.data, reservasNoDia]);

  const slotEstaSelecionado = (slot) => {
    if (!form.horarioInicio || !form.horarioFim) return false;
    const inicioSel = formatTimeISO(form.horarioInicio);
    const fimSel = formatTimeISO(form.horarioFim);
    return slot.inicio >= inicioSel && slot.fim <= fimSel;
  };

  const handleSlotClick = (slot) => {
    if (slot.ocupado) return;
    setForm((prev) => ({
      ...prev,
      horarioInicio: parseTimeISO(slot.inicio),
      horarioFim: parseTimeISO(slot.fim),
    }));
    markTouched("horarioInicio");
    markTouched("horarioFim");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const showError = (field) => touched[field] && errors[field];

  const handleConfirm = () => {
    setTouched({
      data: true,
      horarioInicio: true,
      horarioFim: true,
      responsavel: true,
      finalidade: true,
      participantes: true,
    });
    if (!isValid || !room) return;

    setSubmitting(true);
    const payload = {
      id: editandoId || gerarIdReserva(),
      salaId: room.id,
      salaNome: room.nome,
      data: formatDateISO(form.data),
      horarioInicio: formatTimeISO(form.horarioInicio),
      horarioFim: formatTimeISO(form.horarioFim),
      responsavel: form.responsavel.trim(),
      finalidade: form.finalidade.trim(),
      participantes: form.participantes,
      criadoEm: editandoId
        ? reservasExistentes.find((r) => r.id === editandoId)?.criadoEm || new Date().toISOString()
        : new Date().toISOString(),
    };

    const acao = editandoId ? onEditarReserva : onConfirm;
    Promise.resolve(acao?.(payload)).finally(() => {
      setSubmitting(false);
    });
  };

  const footer = (
    <div className="rfm-footer">
      <Button label="Cancelar" text severity="secondary" onClick={onHide} disabled={submitting} />
      <Button
        label={editandoId ? "Salvar alterações" : "Confirmar reserva"}
        icon="pi pi-check"
        onClick={handleConfirm}
        loading={submitting}
        disabled={!room}
      />
    </div>
  );

  const header = room ? (
    <div className="rfm-header">
      <img src={room.imagem} alt={room.nome} className="rfm-header-img" />
      <div className="rfm-header-info">
        <span className="rfm-header-title">{room.nome}</span>
        <div className="rfm-header-meta">
          <Tag value={room.localizacao} severity="info" />
          <Tag value={room.capacidade} severity="secondary" />
          <Tag value={room.tipo} />
        </div>
      </div>
    </div>
  ) : (
    "Nova reserva"
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      className="rfm-dialog"
      modal
      dismissableMask
      footer={footer}
      breakpoints={{ "960px": "90vw", "560px": "96vw" }}
      style={{ width: "560px" }}
    >
      {room && (
        <>
          {room.recursos?.length > 0 && (
            <div className="rfm-recursos">
              {room.recursos.map((r) => (
                <Tag key={r} value={r} icon="pi pi-check" severity="success" className="rfm-recurso-tag" />
              ))}
            </div>
          )}

          {proximasReservas.length > 0 && (
            <div className="rfm-agenda">
              <div className="rfm-agenda-titulo">
                <i className="pi pi-calendar" /> Próximas reservas desta sala
              </div>
              <ul className="rfm-agenda-lista">
                {proximasReservas.map((r) => (
                  <li key={r.id ?? `${r.data}-${r.horarioInicio}`}>
                    <span className="rfm-agenda-info">
                      <strong>{formatDateBR(r.data)}</strong>
                      <span> · {r.horarioInicio}–{r.horarioFim}</span>
                      <span className="rfm-agenda-responsavel"> · {r.responsavel}</span>

                      {/* Indicadores visuais de Check-in */}
                      {r.checkedIn && <Tag value="Check-in Realizado" severity="success" className="ml-2" />}
                      {r.status === 'Expirada' && <Tag value="Expirada" severity="danger" className="ml-2" />}
                    </span>
                    <span className="rfm-agenda-acoes">
                      {onEditarReserva && (
                        <button
                          type="button"
                          className="rfm-agenda-editar"
                          title="Editar esta reserva"
                          onClick={() => handleEditarClick(r)}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      )}
                      {onCancelarReserva && (
                        <button
                          type="button"
                          className="rfm-agenda-cancelar"
                          title="Cancelar esta reserva"
                          onClick={(e) => handleCancelarClick(e, r)}
                        >
                          <i className="pi pi-trash" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- BLOCO DO QR CODE DE CHECK-IN PARA HOJE --- */}
          {(() => {
            const hojeStr = formatDateISO(new Date());
            const reservaParaCheckInHoje = reservasExistentes.find(
              (r) => r.data === hojeStr && !r.checkedIn && r.status !== 'Expirada'
            );

            if (!reservaParaCheckInHoje) return null;

            return (
              <div className="rfm-agenda" style={{ textAlign: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
                <div className="rfm-agenda-titulo" style={{ marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>
                  <i className="pi pi-qrcode" style={{ marginRight: '6px' }} /> 
                  QR Code para Check-in ({reservaParaCheckInHoje.horarioInicio} - {reservaParaCheckInHoje.horarioFim})
                </div>
                
                <div style={{ background: '#fff', display: 'inline-block', padding: '10px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <QRCodeCanvas 
                    value={reservaParaCheckInHoje.id} 
                    size={120}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"}
                    level={"M"}
                    includeMargin={true}
                  />
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginBottom: '10px' }}>
                  Responsável: <strong>{reservaParaCheckInHoje.responsavel}</strong><br/>
                  Escaneie para confirmar presença.
                </p>

                {onEditarReserva && (
                  <button
                    type="button"
                    onClick={() => {
                      const atualizada = {
                        ...reservaParaCheckInHoje,
                        checkedIn: true,
                        checkInAt: new Date().toISOString(),
                        status: 'Em Andamento'
                      };
                      onEditarReserva(atualizada);
                    }}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    <i className="pi pi-check-circle" style={{ marginRight: '4px' }} /> Simular Leitura do QR Code
                  </button>
                )}
              </div>
            );
          })()}

          {editandoId && (
            <div className="rfm-editando-aviso">
              <span>
                <i className="pi pi-pencil" /> Editando uma reserva existente
              </span>
              <button type="button" className="rfm-editando-cancelar" onClick={handleCancelarEdicao}>
                Cancelar edição
              </button>
            </div>
          )}

          <ConfirmPopup />

          <Divider />

          <div className="rfm-grid">
            <div className="rfm-field">
              <label htmlFor="rfm-data">Data</label>
              <Calendar
                inputId="rfm-data"
                value={form.data}
                onChange={(e) => handleChange("data", e.value)}
                onBlur={() => markTouched("data")}
                dateFormat="dd/mm/yy"
                minDate={new Date()}
                showIcon
                className={classNames({ "p-invalid": showError("data") })}
                placeholder="Selecione a data"
              />
              {showError("data") && <small className="rfm-error">{errors.data}</small>}
            </div>

            <div className="rfm-field rfm-field-half">
              <label htmlFor="rfm-inicio">Início</label>
              <Calendar
                inputId="rfm-inicio"
                value={form.horarioInicio}
                onChange={(e) => handleChange("horarioInicio", e.value)}
                onBlur={() => markTouched("horarioInicio")}
                timeOnly
                hourFormat="24"
                showIcon
                icon="pi pi-clock"
                className={classNames({ "p-invalid": showError("horarioInicio") })}
                placeholder="00:00"
              />
              {showError("horarioInicio") && <small className="rfm-error">{errors.horarioInicio}</small>}
            </div>

            <div className="rfm-field rfm-field-half">
              <label htmlFor="rfm-fim">Término</label>
              <Calendar
                inputId="rfm-fim"
                value={form.horarioFim}
                onChange={(e) => handleChange("horarioFim", e.value)}
                onBlur={() => markTouched("horarioFim")}
                timeOnly
                hourFormat="24"
                showIcon
                icon="pi pi-clock"
                className={classNames({ "p-invalid": showError("horarioFim") })}
                placeholder="00:00"
              />
              {showError("horarioFim") && <small className="rfm-error">{errors.horarioFim}</small>}
            </div>

            {form.data && (
              <div className="rfm-field rfm-field-full">
                <label>Horários do dia (clique num horário livre para preencher)</label>
                <div className="rfm-slots-grid">
                  {slotsComStatus.map((slot) => (
                    <button
                      key={slot.inicio}
                      type="button"
                      disabled={slot.ocupado}
                      title={slot.ocupado ? `Ocupado por ${slot.responsavel}` : `Selecionar ${slot.inicio}`}
                      onClick={() => handleSlotClick(slot)}
                      className={classNames("rfm-slot", {
                        "rfm-slot-ocupado": slot.ocupado,
                        "rfm-slot-selecionado": !slot.ocupado && slotEstaSelecionado(slot),
                      })}
                    >
                      {slot.inicio}
                    </button>
                  ))}
                </div>
                <div className="rfm-slots-legenda">
                  <span className="rfm-legenda-item">
                    <span className="rfm-legenda-dot rfm-legenda-livre" /> Livre
                  </span>
                  <span className="rfm-legenda-item">
                    <span className="rfm-legenda-dot rfm-legenda-selecionado" /> Selecionado
                  </span>
                  <span className="rfm-legenda-item">
                    <span className="rfm-legenda-dot rfm-legenda-ocupado" /> Ocupado
                  </span>
                </div>
              </div>
            )}

            <div className="rfm-field">
              <label htmlFor="rfm-responsavel">Responsável</label>
              <InputText
                id="rfm-responsavel"
                value={form.responsavel}
                onChange={(e) => handleChange("responsavel", e.target.value)}
                onBlur={() => markTouched("responsavel")}
                className={classNames({ "p-invalid": showError("responsavel") })}
                placeholder="Nome do responsável"
              />
              {showError("responsavel") && <small className="rfm-error">{errors.responsavel}</small>}
            </div>

            <div className="rfm-field">
              <label htmlFor="rfm-participantes">Participantes</label>
              <InputNumber
                inputId="rfm-participantes"
                value={form.participantes}
                onValueChange={(e) => handleChange("participantes", e.value)}
                onBlur={() => markTouched("participantes")}
                min={1}
                max={capacidadeNumerica || undefined}
                showButtons
                className={classNames({ "p-invalid": showError("participantes") })}
                placeholder={`Até ${capacidadeNumerica || "?"} pessoas`}
              />
              {showError("participantes") && <small className="rfm-error">{errors.participantes}</small>}
            </div>

            <div className="rfm-field rfm-field-full">
              <label htmlFor="rfm-finalidade">Finalidade da reserva</label>
              <InputTextarea
                id="rfm-finalidade"
                value={form.finalidade}
                onChange={(e) => handleChange("finalidade", e.target.value)}
                onBlur={() => markTouched("finalidade")}
                rows={3}
                autoResize
                className={classNames({ "p-invalid": showError("finalidade") })}
                placeholder="Ex.: Reunião de alinhamento do projeto X"
              />
              {showError("finalidade") && <small className="rfm-error">{errors.finalidade}</small>}
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}