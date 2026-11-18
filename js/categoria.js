/* Aurora — página de categoria: filtros, ordenação e busca */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var catSlug = params.get("cat") || "";
  var termoBusca = (params.get("q") || "").trim();

  var estado = {
    tamanhos: new Set(),
    cores: new Set(),
    precoMax: 500,      // valor do range (sem limite prático acima disso)
    somenteEstoque: false,
    somenteSale: false,
    ordenar: params.get("ordenar") || "relevancia"
  };

  var elGrade = document.getElementById("cat-grade");
  var elContagem = document.getElementById("cat-contagem");
  var elTitulo = document.getElementById("cat-titulo");
  var elEyebrow = document.getElementById("cat-eyebrow");
  var elDescricao = document.getElementById("cat-descricao");
  var elMigalha = document.getElementById("migalha-atual");
  var elChips = document.getElementById("cat-chips");
  var elTamanhos = document.getElementById("f-tamanhos");
  var elCores = document.getElementById("f-cores");
  var elPreco = document.getElementById("f-preco");
  var elPrecoValor = document.getElementById("f-preco-valor");
  var elEstoque = document.getElementById("f-estoque");
  var elSale = document.getElementById("f-sale");
  var elVazio = document.getElementById("cat-vazio");
  var elOrdenar = document.getElementById("cat-ordenar");

  /* ---------- base (helpers locais) ---------- */
  function categoriaAtual() {
    return CATEGORIAS.find(c => c.slug === catSlug) || null;
  }

  function estoqueTotal(p) {
    return Object.values(p.tamanhos).reduce((s, q) => s + q, 0);
  }

  function buscar(q) {
    q = q.trim().toLowerCase();
    return PRODUTOS.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      nomeCategoria(p.categoria).toLowerCase().includes(q) ||
      p.resumo.toLowerCase().includes(q) ||
      p.cores.some(c => c.toLowerCase().includes(q))
    );
  }

  function base() {
    if (termoBusca) return buscar(termoBusca);
    if (catSlug === 'novidades') return PRODUTOS.filter(p => p.novo);
    if (catSlug === 'sale') return PRODUTOS.filter(p => p.precoAntigo);
    if (catSlug) return PRODUTOS.filter(p => p.categoria === catSlug);
    return PRODUTOS.slice();
  }

  function tituloPagina() {
    if (termoBusca) return "Busca: " + termoBusca;
    var c = categoriaAtual();
    return c ? c.nome : "Catálogo";
  }

  /* ---------- opções dinâmicas de filtro ---------- */
  function montarOpcoes() {
    var lista = base();
    var tamanhos = [];
    var cores = [];

    lista.forEach(function (p) {
      Object.keys(p.tamanhos || {}).forEach(function (t) {
        if (tamanhos.indexOf(t) === -1) tamanhos.push(t);
      });
      (p.cores || []).forEach(function (c) {
        if (cores.indexOf(c) === -1) cores.push(c);
      });
    });
    tamanhos.sort(function (a, b) {
      var ia = TAMANHOS_ROUPA.indexOf(a); if (ia < 0) ia = TAMANHOS_CALCA.indexOf(a);
      var ib = TAMANHOS_ROUPA.indexOf(b); if (ib < 0) ib = TAMANHOS_CALCA.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return String(a).localeCompare(String(b));
    });

    elTamanhos.innerHTML = tamanhos.map(function (t) {
      return '<label class="opcao"><input type="checkbox" data-tamanho="' + esc(t) + '">' +
        "<span>" + esc(t) + "</span></label>";
    }).join("") || '<p class="suave" style="font-size:.9rem">Sem opções</p>';

    elCores.innerHTML = cores.map(function (c) {
      return '<label class="opcao"><input type="checkbox" data-cor="' + esc(c) + '">' +
        "<span>" + esc(c) + "</span></label>";
    }).join("") || '<p class="suave" style="font-size:.9rem">Sem opções</p>';
  }

  /* ---------- filtrar ---------- */
  function filtrar() {
    var lista = base();

    if (estado.tamanhos.size) {
      lista = lista.filter(function (p) {
        return Object.keys(p.tamanhos).some(function (t) {
          return estado.tamanhos.has(t) && p.tamanhos[t] > 0;
        });
      });
    }
    if (estado.cores.size) {
      lista = lista.filter(function (p) {
        return p.cores.some(function (c) { return estado.cores.has(c); });
      });
    }
    if (estado.precoMax < 500) {
      lista = lista.filter(function (p) { return p.preco <= estado.precoMax; });
    }
    if (estado.somenteEstoque) {
      lista = lista.filter(function (p) { return estoqueTotal(p) > 0; });
    }
    if (estado.somenteSale) {
      lista = lista.filter(function (p) { return p.precoAntigo > p.preco; });
    }

    var ord = estado.ordenar;
    if (ord === "menor") lista.sort(function (a, b) { return a.preco - b.preco; });
    else if (ord === "maior") lista.sort(function (a, b) { return b.preco - a.preco; });
    else if (ord === "novidades") {
      lista.sort(function (a, b) {
        return (b.novo ? 1 : 0) - (a.novo ? 1 : 0) || (b.vendidos || 0) - (a.vendidos || 0);
      });
    } else if (ord === "vendidos") {
      lista.sort(function (a, b) { return (b.vendidos || 0) - (a.vendidos || 0); });
    }

    return lista;
  }

  /* ---------- render ---------- */
  function render() {
    var lista = filtrar();

    if (elTitulo) elTitulo.textContent = tituloPagina();
    if (elMigalha) elMigalha.textContent = tituloPagina();
    if (elEyebrow) elEyebrow.textContent = termoBusca ? "Resultados" : "Coleção Aurora";
    if (elDescricao) {
      var c = categoriaAtual();
      elDescricao.textContent = termoBusca
        ? "Encontramos estas peças para você."
        : (c && c.desc ? c.desc : "");
      elDescricao.hidden = !elDescricao.textContent;
    }
    elContagem.innerHTML = "<strong>" + lista.length + "</strong> " +
      (lista.length === 1 ? "produto" : "produtos");

    if (lista.length) {
      elVazio.hidden = true;
      elGrade.innerHTML = lista.map(cardProduto).join("");
      ligarFavoritos(elGrade);
    } else {
      elVazio.hidden = false;
      elGrade.innerHTML = "";
    }

    renderChips();
  }

  function renderChips() {
    var chips = [];
    estado.tamanhos.forEach(function (t) {
      chips.push('<button class="chip" data-tipo="tamanho" data-valor="' + esc(t) + '">' +
        esc(t) + ' <span aria-hidden="true">×</span></button>');
    });
    estado.cores.forEach(function (c) {
      chips.push('<button class="chip" data-tipo="cor" data-valor="' + esc(c) + '">' +
        esc(c) + ' <span aria-hidden="true">×</span></button>');
    });
    if (estado.precoMax < 500) {
      chips.push('<button class="chip" data-tipo="preco" data-valor="">' +
        "até " + brl(estado.precoMax) + ' <span aria-hidden="true">×</span></button>');
    }
    if (estado.somenteEstoque) {
      chips.push('<button class="chip" data-tipo="estoque" data-valor="">' +
        'Em estoque <span aria-hidden="true">×</span></button>');
    }
    if (estado.somenteSale) {
      chips.push('<button class="chip" data-tipo="sale" data-valor="">' +
        'Promoção <span aria-hidden="true">×</span></button>');
    }
    elChips.innerHTML = chips.join("");
  }

  function temFiltro() {
    return estado.tamanhos.size > 0 || estado.cores.size > 0 ||
      estado.precoMax < 500 || estado.somenteEstoque || estado.somenteSale;
  }

  function limparTudo() {
    estado.tamanhos.clear();
    estado.cores.clear();
    estado.precoMax = 500;
    estado.somenteEstoque = false;
    estado.somenteSale = false;
    document.querySelectorAll("#filtros input[type=checkbox]").forEach(function (i) {
      i.checked = false;
    });
    elPreco.value = 500;
    elPrecoValor.textContent = "até R$ 500";
    render();
  }

  /* ---------- eventos ---------- */
  document.getElementById("filtros").addEventListener("change", function (e) {
    var alvo = e.target;
    if (alvo.dataset.tamanho) {
      alvo.checked ? estado.tamanhos.add(alvo.dataset.tamanho)
                   : estado.tamanhos.delete(alvo.dataset.tamanho);
    } else if (alvo.dataset.cor) {
      alvo.checked ? estado.cores.add(alvo.dataset.cor)
                   : estado.cores.delete(alvo.dataset.cor);
    } else if (alvo.id === "f-estoque") {
      estado.somenteEstoque = alvo.checked;
    } else if (alvo.id === "f-sale") {
      estado.somenteSale = alvo.checked;
    } else {
      return;
    }
    render();
  });

  // slider de preço
  elPreco.addEventListener("input", function () {
    estado.precoMax = parseInt(elPreco.value, 10);
    elPrecoValor.textContent = estado.precoMax >= 500
      ? "até R$ 500"
      : "até " + brl(estado.precoMax);
    render();
  });

  // chips: remover filtro individual
  elChips.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    var tipo = btn.dataset.tipo;
    var valor = btn.dataset.valor;
    if (tipo === "tamanho") {
      estado.tamanhos.delete(valor);
      var cbT = elTamanhos.querySelector('[data-tamanho="' + CSS.escape(valor) + '"]');
      if (cbT) cbT.checked = false;
    } else if (tipo === "cor") {
      estado.cores.delete(valor);
      var cbC = elCores.querySelector('[data-cor="' + CSS.escape(valor) + '"]');
      if (cbC) cbC.checked = false;
    } else if (tipo === "preco") {
      estado.precoMax = 500;
      elPreco.value = 500;
      elPrecoValor.textContent = "até R$ 500";
    } else if (tipo === "estoque") {
      estado.somenteEstoque = false;
      elEstoque.checked = false;
    } else if (tipo === "sale") {
      estado.somenteSale = false;
      elSale.checked = false;
    }
    render();
  });

  document.getElementById("limpar-todos").addEventListener("click", limparTudo);
  document.getElementById("vazio-limpar").addEventListener("click", limparTudo);

  // ordenação
  elOrdenar.value = estado.ordenar;
  elOrdenar.addEventListener("change", function () {
    estado.ordenar = elOrdenar.value;
    render();
  });

  /* ---------- painel de filtros no mobile ---------- */
  var btnAbrir = document.getElementById("filtros-abrir");
  var btnFechar = document.getElementById("filtros-fechar");
  var btnAplicar = document.getElementById("filtros-aplicar-movel");
  var painel = document.getElementById("filtros");

  function abrirFiltros(aberto) {
    painel.classList.toggle("aberto", aberto);
    btnAbrir.setAttribute("aria-expanded", aberto ? "true" : "false");
    document.body.style.overflow = aberto ? "hidden" : "";
  }
  if (btnAbrir) btnAbrir.addEventListener("click", function () { abrirFiltros(true); });
  if (btnFechar) btnFechar.addEventListener("click", function () { abrirFiltros(false); });
  if (btnAplicar) btnAplicar.addEventListener("click", function () { abrirFiltros(false); });

  /* ---------- início ---------- */
  montarOpcoes();
  render();
})();
