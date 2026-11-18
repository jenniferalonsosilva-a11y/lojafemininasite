/* ============================================================
   Aurora — página inicial
   ============================================================ */

/* Categorias em destaque com imagem do catálogo */
const CAT_IMAGENS = {
  vestidos:     'assets/img/p07.jpg',
  conjuntos:    'assets/img/p24.jpg',
  blusas:       'assets/img/p43.jpg',
  'saias-shorts': 'assets/img/p06.jpg',
  calcas:       'assets/img/p19.jpg',
  acessorios:   'assets/img/p03.jpg',
  roupas:       'assets/img/p36.jpg'
};

function montarCategorias() {
  const alvo = document.getElementById('grade-cats');
  if (!alvo) return;
  const ids = ['vestidos', 'conjuntos', 'blusas', 'saias-shorts', 'calcas', 'acessorios', 'roupas'];
  alvo.innerHTML = ids.map(id => {
    const c = CATEGORIAS.find(c => c.id === id);
    if (!c) return '';
    return `
      <a class="cat-card" href="categoria.html?cat=${c.slug}">
        <img src="${CAT_IMAGENS[id]}" alt="${esc(c.nome)}" loading="lazy" width="450" height="600">
        <span class="cat-card-rotulo">${esc(c.nome)}</span>
      </a>`;
  }).join('');
}

function montarNovidades() {
  const alvo = document.getElementById('grade-novidades');
  if (!alvo) return;
  const lista = PRODUTOS.filter(p => p.novo).slice(0, 4);
  alvo.innerHTML = lista.map(cardProduto).join('');
  ligarFavoritos(alvo);
}

function montarVendidas() {
  const alvo = document.getElementById('grade-vendidas');
  if (!alvo) return;
  const lista = [...PRODUTOS].sort((a, b) => b.vendidos - a.vendidos).slice(0, 4);
  alvo.innerHTML = lista.map(cardProduto).join('');
  ligarFavoritos(alvo);
}

function montarLooks() {
  const alvo = document.getElementById('grade-looks');
  if (!alvo) return;
  alvo.innerHTML = LOOKS.map(look => {
    const itens = look.produtos
      .map(id => acharProduto(id))
      .filter(Boolean)
      .map(p => `
        <a class="look-item" href="produto.html?id=${encodeURIComponent(p.id)}">
          <span>${esc(p.nome)}</span>
          <span>${brl(p.preco)}</span>
        </a>`).join('');

    const total = look.produtos
      .map(id => acharProduto(id))
      .filter(Boolean)
      .reduce((s, p) => s + p.preco, 0);

    return `
      <article class="look-card">
        <img src="${look.img}" alt="Look ${esc(look.titulo)}" loading="lazy" width="600" height="750">
        <div class="look-corpo">
          <h3>${esc(look.titulo)}</h3>
          <p>${esc(look.texto)}</p>
          <div class="look-itens">${itens}</div>
          <div class="look-item" style="border-top:1px solid var(--marrom)">
            <span><strong>Look completo</strong></span>
            <span><strong>${brl(total)}</strong></span>
          </div>
          <a class="btn btn--contorno btn--largo" href="carrinho.html">Comprar o look</a>
        </div>
      </article>`;
  }).join('');
}

function montarInformativos() {
  const alvo = document.getElementById('faixa-info');
  if (!alvo) return;
  alvo.innerHTML = INFORMATIVOS.map(i => `
    <li>
      <h3>${esc(i.titulo)}</h3>
      <p>${esc(i.texto)}</p>
    </li>`).join('');
}

function configurarNewsletter() {
  const form = document.getElementById('form-newsletter');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('news-email');
    const msg = document.getElementById('news-msg');
    if (!email.value.trim()) return;
    msg.textContent = 'Pronto! Seu cupom AURORA10 já está valendo — confira no e-mail.';
    email.value = '';
    toast('Cadastro realizado. Bem-vinda!');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  montarCategorias();
  montarNovidades();
  montarVendidas();
  montarLooks();
  montarInformativos();
  configurarNewsletter();
});
