# Sistema NEXUS — projeto dividido em múltiplos arquivos

Este projeto é a mesma aplicação React do arquivo único `Sistema_NEXUS.html`,
porém separada em módulos pequenos e coesos (1 componente/página/responsabilidade
por arquivo) para facilitar leitura, revisão e métricas de qualidade de código
(tamanho de arquivo, complexidade, responsabilidade única).

Não usa bundler (Vite/Webpack) — o React e o Babel continuam sendo carregados
via CDN e o JSX é transpilado no navegador, exatamente como no arquivo único.
A diferença é que, em vez de um só `<script>` gigante, o `index.html` carrega
~28 arquivos pequenos, em ordem de dependência.

## ⚠️ Como rodar

Por causa da forma como os navegadores tratam múltiplos arquivos, **abrir o
`index.html` direto com duplo-clique (file://) pode não funcionar** em alguns
navegadores (o Chrome bloqueia o carregamento de arquivos locais adicionais
por segurança). Para rodar corretamente, sirva a pasta com um servidor local:

```bash
# dentro da pasta nexus-app/
python3 -m http.server 8000
# depois abra http://localhost:8000 no navegador
```

Ou, se preferir Node:
```bash
npx serve .
```

Isso não é necessário para o arquivo único (`Sistema_NEXUS.html`), que
continua funcionando com duplo-clique normalmente — use-o se precisar de algo
100% portátil sem servidor.

## Estrutura de pastas

```
nexus-app/
├── index.html                      → carrega CSS + todos os scripts, em ordem
├── css/
│   └── styles.css                  → todo o CSS (design tokens, layout, componentes)
└── src/
    ├── utils/
    │   ├── reactGlobals.js         → atalhos useState/useEffect/useRef
    │   ├── helpers.js              → funções puras (datas, formatação, cálculos)
    │   ├── constants.js            → paleta de cores, status, estágios de orçamento
    │   └── pageMeta.js             → título/subtítulo de cada página
    ├── data/
    │   └── seedData.js             → dados fictícios iniciais (clientes, tickets, etc.)
    ├── components/
    │   ├── Icons.jsx                → ícones SVG
    │   ├── Shared.jsx               → Kpi, BarCol, PrioBar, TicketRow, Toast
    │   ├── NavConfig.jsx            → estrutura de navegação da sidebar
    │   ├── Sidebar.jsx
    │   ├── Topbar.jsx
    │   ├── TicketModal.jsx          → modal de detalhes do chamado
    │   ├── LoginScreen.jsx
    │   └── FirstAccessScreen.jsx    → troca de senha no primeiro acesso
    ├── pages/
    │   ├── empresa/                 → Painel Financeiro, Clientes, Caixa,
    │   │                               Orçamentos, Serviços, Chamados,
    │   │                               Dashboard, Personalização, Acessos
    │   └── cliente/                 → Início, Meus Chamados, Nova Solicitação, Perfil
    ├── App.jsx                      → componente raiz (estado global + rotas)
    └── main.jsx                     → ponto de entrada (ReactDOM.createRoot)
```

Todos os arquivos são pequenos (a maioria entre 15 e 110 linhas; o maior,
`App.jsx`, tem 192). Cada arquivo tem um comentário no topo explicando sua
responsabilidade e, quando relevante, de quais outros arquivos ele depende.

## Sobre a ordem de carregamento

Como não há bundler, os arquivos são carregados como `<script>` simples (os
que são JS puro, sem JSX) e `<script type="text/babel">` (os que têm JSX).
Eles compartilham o mesmo escopo global — por isso a ordem no `index.html`
importa: cada arquivo é carregado depois de tudo que ele usa. Se algum dia
migrar para um bundler real (Vite, por exemplo), essa ordem vira `import`/
`export` normais e o `index.html` fica bem mais simples.
