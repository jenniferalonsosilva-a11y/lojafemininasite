/* ============================================================
   Aurora — lógica compartilhada entre as páginas
   Cabeçalho, busca, carrinho, favoritos, toast e WhatsApp
   ============================================================ */

/* ---------- Armazenamento ---------- */
const Store = {
  ler(chave, padrao) {
    try {
      const v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch { return padrao; }
  },
  gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* silencioso */ }
  }
};

const CARRINHO_CHAVE = 'aurora_carrinho';
const FAVORITOS_CHAVE = 'aurora_favoritos';

/* ---------- Utilitários ---------- */
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function brl(v) { return BRL.format(v); }

function acharProduto(id) { return PRODUTOS.find(p => p.id === id); }

function nomeCategoria(id) {
  const c = CATEGORIAS.find(c => c.id === id);
  return c ? c.nome : id;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Ícones reutilizados */
const ICONES = {
  coracao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  lupa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sacola: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>',
  usuario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  caminhao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 7h11v10H2zM13 10h4l4 3.5V17h-8z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  whats: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.5-4.4-3 0-4.8 2.3-4.8 4.6 0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.4 2.8A10 10 0 1 0 12 2z"/></svg>'
};

/* ---------- Toast ---------- */
function toast(msg, tipo = 'ok') {
  let area = document.querySelector('.toast-area');
  if (!area) {
    area = document.createElement('div');
    area.className = 'toast-area';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    document.body.appendChild(area);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = (tipo === 'ok' ? ICONES.check : ICONES.sacola) + '<span>' + esc(msg) + '</span>';
  area.appendChild(el);
  setTimeout(() => {
    el.classList.add('saindo');
    setTimeout(() => el.remove(), 320);
  }, 2800);
}

/* ---------- Carrinho ---------- */
const Carrinho = {
  itens() { return Store.ler(CARRINHO_CHAVE, []); },

  salvar(itens) {
    Store.gravar(CARRINHO_CHAVE, itens);
    UI.atualizarContador();
  },

  adicionar(produto, tamanho, cor, qtd = 1) {
    const itens = this.itens();
    const chave = `${produto.id}|${tamanho}|${cor}`;
    const existente = itens.find(i => i.chave === chave);
    if (existente) {
      existente.qtd = Math.min(existente.qtd + qtd, 10);
    } else {
      itens.push({
        chave, id: produto.id, tamanho, cor, qtd,
        nome: produto.nome, preco: produto.preco,
        img: produto.img, categoria: produto.categoria
      });
    }
    this.salvar(itens);
  },

  atualizar(chave, novaQtd) {
    let itens = this.itens();
    if (novaQtd <= 0) {
      itens = itens.filter(i => i.chave !== chave);
    } else {
      const it = itens.find(i => i.chave === chave);
      if (it) it.qtd = Math.min(novaQtd, 10);
    }
    this.salvar(itens);
    return itens;
  },

  remover(chave) { this.atualizar(chave, 0); },
  limpar() { this.salvar([]); },

  total() { return this.itens().reduce((s, i) => s + i.preco * i.qtd, 0); },
  quantidade() { return this.itens().reduce((s, i) => s + i.qtd, 0); }
};

/* ---------- Favoritos ---------- */
const Favoritos = {
  lista() { return Store.ler(FAVORITOS_CHAVE, []); },
  tem(id) { return this.lista().includes(id); },
  alternar(id) {
    const l = this.lista();
    const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    Store.gravar(FAVORITOS_CHAVE, l);
    return i < 0;
  }
};

/* ---------- Interface do cabeçalho ---------- */
const UI = {
  atualizarContador() {
    const el = document.getElementById('cont-carrinho');
    if (!el) return;
    const q = Carrinho.quantidade();
    el.textContent = q > 99 ? '99+' : q;
    el.hidden = q === 0;
    el.setAttribute('aria-hidden', 'true');
    const link = el.closest('a');
    if (link) {
      link.setAttribute('aria-label', q === 0
        ? 'Carrinho de compras, vazio'
        : `Carrinho de compras, ${q} ${q === 1 ? 'item' : 'itens'}`);
    }
  },

  destacarNav() {
    const pagina = document.body.dataset.pagina;
    if (!pagina) return;
    document.querySelectorAll('.nav-link').forEach(a => {
      if (a.dataset.cat === pagina) a.setAttribute('aria-current', 'page');
    });
  }
};

/* ---------- Busca ---------- */
function configurarBusca() {
  const btn = document.getElementById('btn-busca');
  const barra = document.getElementById('busca-barra');
  const form = document.getElementById('busca-form');
  const input = document.getElementById('busca-input');
  const caixa = document.getElementById('busca-sugestoes');
  if (!btn || !form) return;

  btn.addEventListener('click', () => {
    const abrir = barra.hidden;
    barra.hidden = !abrir;
    btn.setAttribute('aria-expanded', String(abrir));
    if (abrir) setTimeout(() => input.focus(), 40);
    else if (caixa) caixa.hidden = true;
  });

  function resultados(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) return [];
    return PRODUTOS.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      nomeCategoria(p.categoria).toLowerCase().includes(q) ||
      p.resumo.toLowerCase().includes(q) ||
      p.cores.some(c => c.toLowerCase().includes(q))
    ).slice(0, 6);
  }

  function renderizar() {
    const res = resultados(input.value);
    if (!input.value.trim() || input.value.trim().length < 2) { caixa.hidden = true; return; }
    if (!res.length) {
      caixa.innerHTML = '<div class="sugestao"><span class="suave pequeno">Nada encontrado. Tente outro termo.</span></div>';
      caixa.hidden = false;
      return;
    }
    caixa.innerHTML = res.map(p => `
      <a class="sugestao" href="produto.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.img}" alt="" loading="lazy">
        <span>
          <span class="sugestao-nome">${esc(p.nome)}</span><br>
          <span class="sugestao-cat">${esc(nomeCategoria(p.categoria))}</span>
        </span>
        <span class="sugestao-preco">${brl(p.preco)}</span>
      </a>`).join('');
    caixa.hidden = false;
  }

  input.addEventListener('input', renderizar);
  input.addEventListener('focus', renderizar);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    caixa.hidden = true;
    window.location.href = 'categoria.html?q=' + encodeURIComponent(q);
  });

  document.addEventListener('click', e => {
    if (!barra.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      if (caixa) caixa.hidden = true;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !barra.hidden) {
      barra.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      caixa.hidden = true;
    }
  });
}

/* ---------- Menu móvel ---------- */
function configurarMenu() {
  const btn = document.getElementById('btn-menu');
  const menu = document.getElementById('menu-movel');
  const fechar = document.getElementById('menu-fechar');
  if (!btn || !menu) return;

  const abrir = v => {
    menu.classList.toggle('aberto', v);
    btn.setAttribute('aria-expanded', String(v));
    document.body.style.overflow = v ? 'hidden' : '';
    if (v) { const a = menu.querySelector('a'); if (a) a.focus(); }
    else btn.focus();
  };

  btn.addEventListener('click', () => abrir(true));
  if (fechar) fechar.addEventListener('click', () => abrir(false));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => abrir(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('aberto')) abrir(false);
  });
}

/* ---------- Card de produto ---------- */
function cardProduto(p) {
  const favorito = Favoritos.tem(p.id);
  const esgotado = Object.values(p.tamanhos).every(q => q === 0);
  const temNovo = p.novo;
  const temSale = p.precoAntigo;

  let insignia = '';
  let selo = '';
  if (esgotado) { insignia = '<span class="insignia insignia--esgotado">Esgotado</span>'; selo = 'esgotado'; }
  else if (temSale) { insignia = '<span class="insignia insignia--sale">Sale</span>'; selo = 'sale'; }
  else if (temNovo) { insignia = '<span class="insignia insignia--novo">Novo</span>'; selo = 'novo'; }

  const rotulo = 'Ver ' + p.nome + (selo ? ' — ' + selo : '') +
    (esgotado ? ' — avise-me quando chegar' : '');

  const parcelas = p.preco >= 100
    ? `<span class="preco-parcela">ou 3x de ${brl(p.preco / 3)} sem juros</span>` : '';

  return `
    <article class="card-produto">
      <a class="card-media" href="produto.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(rotulo)}">
        ${insignia}
        <img src="${p.img}" alt="${esc(p.nome)}" loading="lazy" width="450" height="600">
        ${esgotado ? '<span class="card-bloqueio">Avise-me quando chegar</span>' : ''}
      </a>
      <button class="favorito" data-fav="${p.id}"
        aria-pressed="${favorito}"
        aria-label="${favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
        ${ICONES.coracao}
      </button>
      <div class="card-info">
        <span class="card-cat">${esc(nomeCategoria(p.categoria))}</span>
        <h3 class="card-nome"><a href="produto.html?id=${encodeURIComponent(p.id)}">${esc(p.nome)}</a></h3>
        <div class="card-cores">
          ${p.cores.map(c => `<span class="ponto-cor" style="background:${CORES[c] || '#ccc'}" title="${esc(c)}"></span>`).join('')}
        </div>
        <div class="card-preco">
          <span class="preco">${brl(p.preco)}</span>
          ${p.precoAntigo ? `<span class="preco-antigo">${brl(p.precoAntigo)}</span>` : ''}
          ${parcelas}
        </div>
      </div>
    </article>`;
}

/* Liga os botões de favorito dentro de um contêiner */
function ligarFavoritos(cont) {
  cont.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.fav;
      const adicionado = Favoritos.alternar(id);
      document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => {
        b.setAttribute('aria-pressed', String(adicionado));
        b.setAttribute('aria-label', adicionado ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      });
      toast(adicionado ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    });
  });
}

/* ---------- WhatsApp ---------- */
function configurarWhats() {
  const el = document.getElementById('whats');
  if (!el) return;
  const numero = '5511999999999';
  const msg = encodeURIComponent('Olá! Vim pelo site da Aurora e gostaria de ajuda.');
  el.href = `https://wa.me/${numero}?text=${msg}`;
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  UI.atualizarContador();
  UI.destacarNav();
  configurarBusca();
  configurarMenu();
  configurarWhats();
  ligarFavoritos(document);
});
