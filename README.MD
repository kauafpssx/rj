# 🌊 Sistema de Monitoramento do Rio Jacuí.

<div align="center">
  <p>
    <img src="https://img.shields.io/badge/Status-Ativo-4CAF50?style=for-the-badge&logo=checkmarx&logoColor=white"/>
    <img src="https://img.shields.io/badge/Licença-MIT-2196F3?style=for-the-badge&logo=bookstack&logoColor=white"/>
    <img src="https://img.shields.io/badge/Versão-3.0-FF9800?style=for-the-badge&logo=git&logoColor=white"/>
    <img src="https://img.shields.io/badge/Updates-Automáticos-c542f5?style=for-the-badge&logo=clockify&logoColor=white"/>
    <img src="https://img.shields.io/badge/Estações-12-00BCD4?style=for-the-badge&logo=googlemaps&logoColor=white"/>
    <img src="https://img.shields.io/badge/Gráfico-Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
  </p>
</div>



## 📋 Sobre o Projeto:

<img align="right" src="https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-ocean-wave-symbol-sea-water-png-image_4962256.png" width="80" alt="Onda">

Desenvolvi este sistema web que monitora em tempo real **12 estações** dos rios da Bacia do Guaíba (Jacuí, Taquari, Caí, Paranhana, Sinos, Gravataí e Guaíba) utilizando os dados disponibilizados pela API da Agência Nacional de Águas e Saneamento Básico (ANA).

### ✨ Características Principais:

- 🏙️ **12 cidades monitoradas**: Dona Francisca, Cachoeira do Sul, Muçum, Encantado, Lajeado, Bom Retiro do Sul, Feliz, São Sebastião do Caí, Taquara, São Leopoldo, Gravataí e Porto Alegre
- 🎠 **Carrossel interativo** com scroll snap, navegação por teclado e swipe touch
- 📈 **Gráfico Chart.js** com linha de inundação, filtros 24h/7d/30d/Tudo e estatísticas
- 🔔 **Notificação 1x/dia** via Notification API (fallback toast)
- 📊 **Tendência automática** (cm/h) entre as últimas medições
- 🔄 **Atualização automática** via GitHub Actions a cada hora
- 🎨 **Design glassmorphism** responsivo e mobile-first


### 🌊 Estações Monitoradas

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
Desenvolvi o sistema para coletar dados em tempo real de **12 estações** na Bacia do Guaíba através da API da ANA. Os dados são processados e exibidos em uma interface moderna com efeito glassmorphism, apresentando:

&nbsp;
- 🏙️ Nível de **12 cidades** em um carrossel interativo
- 📈 **Gráfico histórico** com linha de inundação e filtros temporais
- 📏 **Tendência** de subida/descida em cm/h
- 🔔 **Notificação** uma vez ao dia com o nível da cidade visitada
- 🔄 **Atualização automática** a cada hora via GitHub Actions (cron/)
- 🧩 **Código modular** — JS dividido em `js/` (config, utils, api, notification, carousel, detail, chart, app)
- 📦 **Node.js** em `cron/` para coleta dos dados da ANA e commit no repositório
</div>

## 🙏 Agradecimentos!

<div align="left">

<img align="right" src="https://cdn-icons-png.flaticon.com/512/3442/3442663.png" width="150" alt="Gota d'água" style="margin-right: 5.13em;">

Agradeço à **Agência Nacional de Águas e Saneamento Básico (ANA)** 💧 por disponibilizar publicamente a API que utilizo neste projeto. Através dos dados fornecidos, consigo:

- 📊 Acessar dados precisos e confiáveis
- ⚡ Realizar atualizações em tempo real
- 🌊 Monitorar constantemente os rios da Bacia do Guaíba
- 🤝 Contribuir com a transparência pública

Os dados disponibilizados pela ANA são essenciais para este projeto, permitindo que eu mantenha minha comunidade sempre bem informada sobre as condições do Rio Jacuí. 🌟
<p align="center">
  <a href="https://www.gov.br/ana/pt-br">
    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Logotipo_ANA_-_Agência_Nacional_de_Águas_e_Saneamento_Básico.png" alt="ANA" width="300">
  </a>
</p>


<p align="center">
  Desenvolvido com 💙 por Kauã Ferreira!
</p>

</div>
