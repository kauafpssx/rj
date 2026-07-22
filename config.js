const path = require('node:path');

const DATA_DIR = path.join(__dirname, 'data');

const ESTACOES = [
  { codigo: 87450020, nome: 'Porto Alegre', municipio: 'Porto Alegre', rio: 'Rio Guaíba', cota_inundacao: 3.60, lat: -30.0346, lon: -51.2177 },
  { codigo: 85400000, nome: 'Dona Francisca', municipio: 'Dona Francisca', rio: 'Rio Jacuí', cota_inundacao: 7.50, lat: -29.6094, lon: -53.3961 },
  { codigo: 85642000, nome: 'Cachoeira do Sul', municipio: 'Cachoeira do Sul', rio: 'Rio Jacuí', cota_inundacao: 18.00, lat: -30.0392, lon: -52.8938 },
  { codigo: 86510000, nome: 'Muçum', municipio: 'Muçum', rio: 'Rio Taquari', cota_inundacao: 18.00, lat: -29.1689, lon: -51.8664 },
  { codigo: 86720000, nome: 'Encantado', municipio: 'Encantado', rio: 'Rio Taquari', cota_inundacao: 12.00, lat: -29.2350, lon: -51.8697 },
  { codigo: 86879300, nome: 'Lajeado', municipio: 'Lajeado', rio: 'Rio Taquari', cota_inundacao: 19.00, lat: -29.4669, lon: -51.9614 },
  { codigo: 86881000, nome: 'Bom Retiro do Sul', municipio: 'Bom Retiro do Sul', rio: 'Rio Taquari', cota_inundacao: 16.50, lat: -29.6167, lon: -51.9337 },
  { codigo: 87165001, nome: 'Feliz', municipio: 'Feliz', rio: 'Rio Caí', cota_inundacao: 9.00, lat: -29.4508, lon: -51.3072 },
  { codigo: 87170000, nome: 'São Sebastião do Caí', municipio: 'São Sebastião do Caí', rio: 'Rio Caí', cota_inundacao: 10.00, lat: -29.5978, lon: -51.3872 },
  { codigo: 87376000, nome: 'Taquara', municipio: 'Taquara', rio: 'Rio Paranhana', cota_inundacao: 5.80, lat: -29.6519, lon: -50.7789 },
  { codigo: 87382000, nome: 'São Leopoldo', municipio: 'São Leopoldo', rio: 'Rio dos Sinos', cota_inundacao: 4.50, lat: -29.7603, lon: -51.1478 },
  { codigo: 87399000, nome: 'Gravataí', municipio: 'Gravataí', rio: 'Rio Gravataí', cota_inundacao: 4.75, lat: -29.9439, lon: -50.9925 },
];

const ALLOWED_ORIGINS = [
  'https://hydromonitor.kauafpss.com.br',
  'https://kauafpssx.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

module.exports = {
  PORT: process.env.PORT || 8300,
  DATA_DIR,
  ESTACOES,
  ALLOWED_ORIGINS,
};
