# 🌊 Sistema de Monitoramento do Rio Jacuí.

<div align="center">
  <p>
    <img src="https://img.shields.io/badge/Status-Ativo-4CAF50?style=for-the-badge&logo=checkmarx&logoColor=white"/>
    <img src="https://img.shields.io/badge/Licença-MIT-2196F3?style=for-the-badge&logo=bookstack&logoColor=white"/>
    <img src="https://img.shields.io/badge/Versão-3.0-FF9800?style=for-the-badge&logo=git&logoColor=white"/>
    <img src="https://img.shields.io/badge/Updates-Automáticos-c542f5?style=for-the-badge&logo=clockify&logoColor=white"/>
    <img src="https://img.shields.io/badge/Estações-12-00BCD4?style=for-the-badge&logo=googlemaps&logoColor=white"/>
  </p>
</div>



## 📋 Sobre o Projeto:

<img align="right" src="https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-ocean-wave-symbol-sea-water-png-image_4962256.png" width="80" alt="Onda">

Este sistema monitora em tempo real 12 estações fluviométricas da Bacia do Guaíba (rios Jacuí, Taquari, Caí, Paranhana, Sinos, Gravataí e Guaíba), usando dados públicos da Agência Nacional de Águas e Saneamento Básico (ANA).

### ✨ Características Principais:

- 🏙️ **12 cidades monitoradas**: Dona Francisca, Cachoeira do Sul, Muçum, Encantado, Lajeado, Bom Retiro do Sul, Feliz, São Sebastião do Caí, Taquara, São Leopoldo, Gravataí e Porto Alegre
- 🎠 **Carrossel interativo** com navegação por teclado, swipe touch e scroll snap
- 📈 **Gráfico** com linha de cota de inundação, filtros de 24h, 7 dias e histórico completo, e estatísticas de mínima, média e máxima
- 📏 **Tendência de subida ou descida** calculada em cm/h entre as últimas medições
- ⛅ **Clima atual por estação**: temperatura, condição, vento e chance de chuva
- 📹 **Câmera ao vivo** do Lago Guaíba embutida na página, com mute e qualidade máxima forçados
- 🔄 **Atualização real a cada 5 minutos**, via API própria rodando em servidor dedicado (AlwaysData)
- 💾 **Cache local** (sessionStorage) evita refazer a mesma requisição ao trocar de estação
- 🎨 **Design glassmorphism** responsivo e mobile-first

<details>
<summary>🌊 Estações Monitoradas</summary>

| Cidade | Rio | Cota de Inundação |
|--------|-----|------------------:|
| Dona Francisca | Rio Jacuí | 7.50m |
| Cachoeira do Sul | Rio Jacuí | 18.00m |
| Muçum | Rio Taquari | 18.00m |
| Encantado | Rio Taquari | 12.00m |
| Lajeado | Rio Taquari | 19.00m |
| Bom Retiro do Sul | Rio Taquari | 16.50m |
| Feliz | Rio Caí | 9.00m |
| São Sebastião do Caí | Rio Caí | 10.00m |
| Taquara | Rio Paranhana | 5.80m |
| São Leopoldo | Rio dos Sinos | 4.50m |
| Gravataí | Rio Gravataí | 4.75m |
| Porto Alegre | Rio Guaíba | 3.60m |

</details>

## 🛠️ Tecnologias Utilizadas:

<table align="center">
  <tr>
    <td align="center" width="180">
      <a href="https://html.spec.whatwg.org/">
        <img src="https://skillicons.dev/icons?i=html" alt="HTML5" width="60" height="60">
        <br>HTML5
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://www.w3.org/Style/CSS/">
        <img src="https://skillicons.dev/icons?i=css" alt="CSS3" width="60" height="60">
        <br>CSS3
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript">
        <img src="https://skillicons.dev/icons?i=js" alt="JavaScript" width="60" height="60">
        <br>JavaScript
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/">
        <img src="https://skillicons.dev/icons?i=github" alt="GitHub" width="60" height="60">
        <br>GitHub
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://nodejs.org/">
        <img src="https://skillicons.dev/icons?i=nodejs" alt="Node.js" width="60" height="60">
        <br>Node.js
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://expressjs.com/">
        <img src="https://skillicons.dev/icons?i=express" alt="Express" width="60" height="60">
        <br>Express
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://www.chartjs.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chartjs/chartjs-original.svg" alt="Chart.js" width="60" height="60">
        <br>Chart.js
      </a>
    </td>
  </tr>
</table>





## 🚀 Como Funciona?

<img align="left" src="https://cdn-icons-png.flaticon.com/512/616/616711.png" width="73" alt="Onda">

<div style="margin-left: 15em;">

O projeto vive em duas branches. A `main` tem o front (HTML, CSS, JS puro, hospedado no GitHub Pages). A `backend` tem uma API Node/Express própria, rodando 24/7 num servidor dedicado (AlwaysData).

O backend é modular: cada domínio (`agua`, `clima`, `live`) tem um coletor e uma rota GET. Um script único (`update.js`) roda os três coletores numa tarefa agendada a cada 5 minutos direto no servidor, sem depender do scheduler do GitHub Actions. Ele consulta a API da ANA, compara o nível de cada estação com o último valor salvo e grava só o que mudou: `dados.json` com o snapshot atual e um `historico_<codigo>.json` por estação, com retenção de 365 dias. Na mesma execução busca o clima das 12 cidades numa única chamada à Open-Meteo, e verifica qual câmera do Lago Guaíba está ativa no momento, direto na fonte.

O front consome tudo isso via fetch, com CORS liberado só pro domínio do site.

&nbsp;
- 🏙️ Nível de **12 cidades** em um carrossel interativo
- 📈 **Gráfico histórico** com linha de inundação e filtros temporais
- 📏 **Tendência** de subida ou descida em cm/h
- ⛅ **Clima atual** de cada estação, direto na tela de detalhe
- 📹 **Câmera ao vivo** do Guaíba embutida abaixo do gráfico
- 🔄 **Coleta a cada 5 minutos**, direto no servidor, gravando só o que mudou
- 🧩 **Front modular**: JS dividido em `js/` (config, utils, api, carousel, detail, chart, live, app)
- 🔌 **Backend modular**: cada domínio isolado em `modules/` (agua, clima, live), com `server.js` servindo as rotas e `update.js` coletando os dados
</div>

## 🙏 Agradecimentos!

<div align="left">

<img align="right" src="https://cdn-icons-png.flaticon.com/512/3442/3442663.png" width="150" alt="Gota d'água" style="margin-right: 5.13em;">

Agradeço à **Agência Nacional de Águas e Saneamento Básico (ANA)** 💧 por manter pública a API que sustenta este projeto. Os dados que ela fornece me dão:

- 📊 Medições precisas e atualizadas
- ⚡ Dados em tempo real, sem atraso
- 🌊 Cobertura constante dos rios da Bacia do Guaíba
- 🤝 Uma base aberta e transparente

Sem a ANA, esse monitoramento não existiria. Uso os dados dela pra manter minha comunidade informada sobre o nível dos rios, principalmente do Jacuí. 🌟
<p align="center">
  <a href="https://www.gov.br/ana/pt-br">
    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Logotipo_ANA_-_Agência_Nacional_de_Águas_e_Saneamento_Básico.png" alt="ANA" width="300">
  </a>
</p>

Agradeço também a quem mantém de graça os outros serviços que esse projeto usa:

- ⛅ **[Open-Meteo](https://open-meteo.com/)**: API de clima gratuita e sem necessidade de chave, usada pros dados de temperatura, vento e chance de chuva de cada estação
- 📹 **[Câmeras ao Vivo RS - Pôr do Sol Guaíba](https://www.youtube.com/@pordosolguaiba)** e o site **[pordosolguaiba.com.br](http://www.pordosolguaiba.com.br/)**: pela transmissão ao vivo do Lago Guaíba embutida na página
- 🖥️ **[AlwaysData](https://www.alwaysdata.com/)**: hospedagem que mantém a API rodando 24/7

<p align="center">
  Desenvolvido com 💙 por Kauã Ferreira!
</p>

</div>
