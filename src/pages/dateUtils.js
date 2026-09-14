// Utilitários de data/hora compartilhados pela SPA de Reserva de Salas.
// Mantemos os valores persistidos (localStorage) como strings simples
// ("YYYY-MM-DD" e "HH:mm") em vez de objetos Date, porque:
//  1) sobrevivem a JSON.stringify/parse sem perder o tipo;
//  2) strings "HH:mm" com zero à esquerda comparam corretamente com
//     operadores < e > (comparação lexicográfica == comparação de horário).

export function pad2(n) {
  return String(n).padStart(2, '0');
}

// Date -> "YYYY-MM-DD"
export function formatDateISO(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Date -> "HH:mm"
export function formatTimeISO(date) {
  if (!date) return null;
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// "YYYY-MM-DD" -> Date (meia-noite, horário local)
export function parseDateISO(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "YYYY-MM-DD" -> "DD/MM/YYYY" (exibição)
export function formatDateBR(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
}

// "HH:mm" -> Date (hoje, com essa hora/minuto) — usado pra alimentar os
// campos de horário (Calendar timeOnly) a partir de um slot clicado.
export function parseTimeISO(str) {
  if (!str) return null;
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Duas faixas [inicioA, fimA) e [inicioB, fimB) (strings "HH:mm") se
// sobrepõem quando cada uma começa antes do fim da outra.
export function horariosSeSobrepoem(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}
