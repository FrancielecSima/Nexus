# O que mudou nesta rodada

Aplicado a partir do diagnóstico em `Nexus_Analise_e_Melhorias.pdf`, mais os
três pedidos extras (periodicidade de cobrança, lançamentos retroativos e
filtro de período no gráfico).

## ✅ Implementado e funcionando agora

**Financeiro**
- Status de pagamento real (Pendente / Pago / Atrasado / Cancelado) em cada
  lançamento de Caixa, com botão rápido "Marcar Pago".
- Periodicidade de cobrança por cliente (Mensal / Trimestral / Anual) — campo
  novo em Clientes.
- Botão **"Gerar Cobranças Futuras"**: cria automaticamente os lançamentos dos
  próximos 12 meses de cada cliente, respeitando a periodicidade (mensal gera
  12, trimestral gera 4, anual gera 1), sem duplicar o que já existe.
- Lançamentos retroativos: o campo de vencimento aceita datas passadas
  livremente — a base de demonstração já vem com ~14 meses de histórico pago
  para você ver o comparativo funcionando de cara.
- Gráfico financeiro com 3 modos: **Últimos 6 meses**, **Ano** (escolha o
  ano) e **Personalizado** (data de início e fim livres).
- Exportação em CSV do período selecionado no gráfico (abre no Excel).
- Nova aba **Gastos**: categoria (Fixo/Variável), marcação de recorrência e
  botão para gerar os gastos fixos do mês automaticamente.
- Segmentação "Clientes por Segmento" agora normaliza pelo valor mensal
  equivalente (um cliente anual de R$4.200 e um mensal de R$350 não ficam
  mais na mesma categoria por engano).

**Suporte**
- SLA e tempo de resposta deixaram de ser ilustrativos — cada chamado agora
  guarda quando foi criado, quando teve a 1ª resposta e quando foi encerrado,
  e os números em todas as telas são calculados a partir disso.
- Equipe interna real (3 pessoas de exemplo) — login agora pede "quem é
  você", e cada chamado pode ser atribuído a uma pessoa específica.
- Busca e filtros na lista de Chamados (texto, status, prioridade,
  responsável).
- Avaliação do cliente (CSAT, 1 a 5 estrelas) liberada assim que um chamado é
  encerrado, com a média exibida no Dashboard de Clientes.

**Estrutura técnica**
- **Persistência local (localStorage)**: os dados agora sobrevivem a um F5 ou
  fechar/abrir o navegador — testei explicitamente recarregando a página de
  verdade. Isso é uma solução interina; se você abrir em outro computador ou
  limpar os dados do navegador, ainda começa do zero. A solução definitiva
  continua sendo migrar para o Supabase (ver `supabase/schema.sql`,
  atualizado com todos os campos novos).
- Nova aba **Auditoria**: toda edição/exclusão de cliente, lançamento de
  caixa ou gasto fica registrada com quem fez, o quê e quando.
- Error Boundary: se algo quebrar inesperadamente, aparece uma tela de aviso
  com botão de recarregar, em vez da tela ficar em branco.

## ⏳ Não implementado — depende de algo que só você tem

- **Conexão real com Supabase**: preciso das credenciais do seu projeto
  (URL + chave). O schema já está pronto e atualizado; assim que você criar
  o projeto e me passar a URL/chave, conecto de fato (aí sim os dados param
  de depender só do navegador).
- **Notificação por e-mail/WhatsApp**: precisa de um serviço de envio (ex:
  Resend, SendGrid, ou a API do WhatsApp Business) e uma chave de API.
- **Ambiente de homologação separado**: é mais uma decisão de processo (ter
  um segundo projeto Supabase + uma segunda cópia do site) do que código —
  posso ajudar a montar quando fizer sentido pra sua operação.
- **Testes automatizados**: não incluídos nesta rodada por escopo; posso
  adicionar depois, focados nos cálculos financeiros.
- **Anexos reais de arquivo** (boleto/nota fiscal/anexo de chamado): hoje
  ainda guardam só o nome do arquivo — vira upload de verdade junto com a
  migração para o Supabase Storage.

## Como testar agora

Sirva a pasta com um servidor local (veja a seção "Como rodar" no
`README.md`) e entre como Equipe — escolha qualquer pessoa da lista
"Quem é você?". Os dados de demonstração já incluem lançamentos pagos dos
últimos meses, então o filtro "Ano" no gráfico financeiro já mostra algo
interessante de cara.
