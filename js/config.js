export const ESTACOES = [
  { codigo: 85400000, nome: 'Dona Francisca', municipio: 'Dona Francisca', rio: 'Rio Jacuí', cota_inundacao: 7.50 },
  { codigo: 85642000, nome: 'Cachoeira do Sul', municipio: 'Cachoeira do Sul', rio: 'Rio Jacuí', cota_inundacao: 18.00 },
  { codigo: 86510000, nome: 'Muçum', municipio: 'Muçum', rio: 'Rio Taquari', cota_inundacao: 18.00 },
  { codigo: 86720000, nome: 'Encantado', municipio: 'Encantado', rio: 'Rio Taquari', cota_inundacao: 12.00 },
  { codigo: 86879300, nome: 'Lajeado', municipio: 'Lajeado', rio: 'Rio Taquari', cota_inundacao: 19.00 },
  { codigo: 86881000, nome: 'Bom Retiro do Sul', municipio: 'Bom Retiro do Sul', rio: 'Rio Taquari', cota_inundacao: 16.50 },
  { codigo: 87165001, nome: 'Feliz', municipio: 'Feliz', rio: 'Rio Caí', cota_inundacao: 9.00 },
  { codigo: 87170000, nome: 'São Sebastião do Caí', municipio: 'São Sebastião do Caí', rio: 'Rio Caí', cota_inundacao: 10.00 },
  { codigo: 87376000, nome: 'Taquara', municipio: 'Taquara', rio: 'Rio Paranhana', cota_inundacao: 5.80 },
  { codigo: 87382000, nome: 'São Leopoldo', municipio: 'São Leopoldo', rio: 'Rio dos Sinos', cota_inundacao: 4.50 },
  { codigo: 87399000, nome: 'Gravataí', municipio: 'Gravataí', rio: 'Rio Gravataí', cota_inundacao: 4.75 },
  { codigo: 87450020, nome: 'Porto Alegre', municipio: 'Porto Alegre', rio: 'Rio Guaíba', cota_inundacao: 3.60 },
];

export const CONFIG = {
  HISTORICO_PATH: './historico.json',
  DADOS_PATH: './dados.json',
  COLORS: {
    green: '#34d399',
    yellow: '#facc15',
    orange: '#f97316',
    red: '#f87171',
    amber: '#f0b429',
    cyan: '#22d3ee',
  },
  NOTIFICATION_KEY: 'rj_last_notified',
};

export function getStatusColor(pct) {
  if (pct < 50) return 'green';
  if (pct < 80) return 'yellow';
  if (pct < 100) return 'orange';
  return 'red';
}

export function getStatusText(pct) {
  if (pct < 50) return 'Normal';
  if (pct < 80) return 'Atenção';
  if (pct < 100) return 'Perigo';
  return 'Inundação!';
}

export function getTrendArrow(val) {
  if (val > 0) return 'arrow-up';
  if (val < 0) return 'arrow-down';
  return 'minus';
}
