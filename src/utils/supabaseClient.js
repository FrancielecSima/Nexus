/* ============================================================
   SUPABASE CLIENT — este projeto não usa bundler (Vite/Webpack),
   então não existe import.meta.env nem "npm install" rodando no
   navegador. O jeito certo aqui é carregar a biblioteca via CDN
   (veja o <script> no index.html) e criar o client como uma
   variável global, do mesmo jeito que uid(), fmtBRL() etc.

   A "publishable key" abaixo é segura para expor publicamente
   (é o substituto atual da antiga "anon key") — ela só funciona
   de acordo com as políticas de RLS que você criou no banco.
   NUNCA coloque a "secret key" aqui.
============================================================ */
const SUPABASE_URL = 'https://pwsxwnbkibhxihbyhtif.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pEhGE8H2kVhFCEoBh7ZIiA_5DHd424q';

// window.supabase vem do script UMD carregado via CDN no index.html.
// Criamos nosso client com outro nome (supabaseClient) pra não colidir
// com o objeto da biblioteca em si.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
