/* Aurora — página de produto: galeria, variantes, compra e sugestões */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var p = PRODUTOS.find(function (x) { return x.id === id; });

  var elDetalhe = document.getElementById("produto-detalhe");
  var elThumbs = document.getElementById("galeria-thumbs");
  var elImg = document.getElementById("galeria-img");
  var elSugestoes = document.getElementById("sugestoes");

  if (!p) {
    document.title = "Produto não encontrado — Aurora";
    elDetalhe.innerHTML =
      '<div class="vazio"><h2>Produto não encontrado</h2>' +
      "<p>Essa peça pode ter saído do catálogo.</p>" +
      '<a class="btn btn--contorno" href="categoria.html" style="margin-top:18px">Ver catálogo</a></div>';
    elThumbs.hidden = true;
    return;
  }

  /* ---------- estado ---------- */
  var estado = {
    cor: p.cores[0],
    tamanho: null,
    qtd: 1,
    img: 0
  };

  var galeria = (p.galeria && p.galeria.length ? p.galeria : [p.img]);
  var esgotado = Object.values(p.tamanhos).every(function (q) { return q === 0; });

  /* ---------- cabeçalho da página ---------- */
  document.title = p.nome + " — Aurora Moda Feminina";
  document.body.dataset.pagina = p.categoria;
  document.getElementById("migalha-cat").textContent = nomeCategoria(p.categoria);
  document.getElementById("migalha-cat").href = "categoria.html?cat=" + encodeURIComponent(p.categoria);
  document.getElementById("migalha-atual").textContent = p.nome;

  /* ---------- galeria ---------- */
  function montarGaleria() {
    elThumbs.innerHTML = galeria.map(function (src, i) {
      return '<button type="button" data-img="' + i + '" aria-current="' + (i === 0) + '" ' +
        'aria-label="Ver imagem ' + (i + 1) + ' de ' + galeria.length + '">' +
        '<img src="' + src + '" alt="" loading="lazy"></button>';
    }).join("");
    elImg.src = galeria[0];
    elImg.alt = p.nome;

    elThumbs.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-img]");
      if (!btn) return;
      estado.img = parseInt(btn.dataset.img, 10);
      elImg.src = galeria[estado.img];
      elThumbs.querySelectorAll("[data-img]").forEach(function (b) {
        b.setAttribute("aria-current", String(b === btn));
      });
    });
  }

  /* ---------- detalhes ---------- */
  function notaAvaliacao() {
    var nota = (4.5 + (p.vendidos % 5) * 0.1).toFixed(1).replace(".", ",");
    var qtd = Math.max(12, Math.round(p.vendidos / 3));
    return { nota: nota, qtd: qtd };
  }

  function datasEntrega() {
    var fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
    var base = new Date();
    function dia(n) { var d = new Date(base); d.setDate(d.getDate() + n); return fmt.format(d); }
    return dia(3) + " e " + dia(7);
  }

  function montarTamanhos() {
    var nomes = Object.keys(p.tamanhos);
    return nomes.map(function (t) {
      var q = p.tamanhos[t];
      var rotulo = p.tipoTamanho === "unico" ? "Único" : t;
      return '<button type="button" class="tamanho-botao" data-tamanho="' + esc(t) + '" aria-pressed="false"' +
        (q === 0 ? ' disabled aria-disabled="true"' : "") + ">" + esc(rotulo) +
        (q === 0 ? '<span class="esgotado-tip">esgotado</span>' : "") + "</button>";
    }).join("");
  }

  function montarCores() {
    return p.cores.map(function (c, i) {
      return '<button type="button" class="cor-botao" data-cor="' + esc(c) + '"' +
        ' aria-pressed="' + (i === 0) + '" title="' + esc(c) + '">' +
        '<span class="ponto-cor" style="background:' + (CORES[c] || "#ccc") + '"></span>' +
        esc(c) + "</button>";
    }).join("");
  }

  function blocoMedidas() {
    if (p.tipoTamanho === "unico") {
      return "<p>Peça de tamanho único. " + esc(p.caimento || "") + "</p>";
    }
    var ehCalca = p.tipoTamanho === "calca";
    var tamanhos = Object.keys(p.tamanhos);
    var cabecalho = ehCalca
      ? "<th>Tamanho</th><th>Cintura</th><th>Quadril</th><th>Comprimento</th>"
      : "<th>Tamanho</th><th>Busto</th><th>Cintura</th><th>Quadril</th>";
    var linhas = tamanhos.map(function (t, i) {
      var b = ehCalca ? 74 + i * 3 : 80 + i * 4;
      var c = ehCalca ? 96 + i * 3 : 64 + i * 4;
      var q = ehCalca ? 100 + i * 3 : 88 + i * 4;
      var extra = ehCalca ? "<td>" + (98 + i) + " cm</td>" : "";
      return "<tr><td>" + esc(t) + "</td><td>" + b + " cm</td><td>" + c + " cm</td><td>" + q + " cm</td>" + extra + "</tr>";
    }).join("");
    return '<table class="tabela-medidas"><thead><tr>' + cabecalho + "</tr></thead><tbody>" +
      linhas + "</tbody></table>" +
      '<p class="mini suave">Medidas do corpo, não da peça. Em dúvida entre dois tamanhos, escolha o maior — ' +
      "ou fale com a gente no WhatsApp que a gente ajuda a escolher.</p>";
  }

  function montarDetalhe() {
    var av = notaAvaliacao();
    var parcela = p.preco >= 100
      ? '<span class="produto-parcela">ou 3x de ' + brl(p.preco / 3) + " sem juros</span>"
      : "";

    var insignia = "";
    if (p.precoAntigo) insignia = '<span class="insignia insignia--sale">Sale</span>';
    else if (p.novo) insignia = '<span class="insignia insignia--novo">Novo</span>';

    elDetalhe.innerHTML = `
      <span class="produto-categoria">${esc(nomeCategoria(p.categoria))}</span>
      <h1 class="produto-nome">${esc(p.nome)}</h1>

      <div class="produto-avaliacao">
        <span class="estrelas" aria-hidden="true">★★★★★</span>
        <span>${av.nota} · ${av.qtd} avaliações</span>
      </div>

      <div class="produto-preco">
        <span class="preco">${brl(p.preco)}</span>
        ${p.precoAntigo ? `<span class="preco-antigo">${brl(p.precoAntigo)}</span>` : ""}
        ${insignia}
        ${parcela}
      </div>

      <p class="produto-resumo">${esc(p.resumo)}</p>

      <div class="bloco-escolha">
        <span class="bloco-rotulo">Cor: <span class="valor" id="cor-valor">${esc(estado.cor)}</span></span>
        <div class="cores-escolha" id="cores-escolha">${montarCores()}</div>
      </div>

      <div class="bloco-escolha">
        <span class="bloco-rotulo">Tamanho: <span class="valor" id="tam-valor">${esgotado ? "esgotado" : "escolha um"}</span>
          <button type="button" class="btn-limpar" id="btn-guia" style="margin-left:10px">Guia de medidas</button>
        </span>
        <div class="tamanhos" id="tamanhos">${montarTamanhos()}</div>
      </div>

      <div class="aviso-estoque${esgotado ? " aviso-estoque--esgotado" : ""}" id="aviso-estoque">
        <span class="ponto"></span>
        <span>${esgotado ? "Esgotado — avise-me quando chegar" : "Selecione o tamanho para ver a disponibilidade"}</span>
      </div>

      <div class="compra">
        <div class="qtd" aria-label="Quantidade">
          <button type="button" id="qtd-menos" aria-label="Diminuir quantidade">−</button>
          <input type="number" id="qtd-input" value="1" min="1" max="10" aria-label="Quantidade">
          <button type="button" id="qtd-mais" aria-label="Aumentar quantidade">+</button>
        </div>
        <button type="button" class="btn btn--primario btn--grande" id="btn-comprar"${esgotado ? " disabled" : ""}>
          ${esgotado ? "Avise-me quando chegar" : "Adicionar à sacola"}
        </button>
        <button type="button" class="favorito-grande" id="btn-favorito"
          aria-pressed="${Favoritos.tem(p.id)}" aria-label="Favoritar">
          ${ICONES.coracao}
        </button>
      </div>

      <div class="entre-compra">
        <div class="entrega-estimada">
          ${ICONES.caminhao}
          <span><strong>Chega entre ${datasEntrega()}</strong><br>
          Frete grátis em compras acima de ${brl(299)} · Primeira troca por nossa conta</span>
        </div>
      </div>

      <div class="accordion">
        <details open>
          <summary>Sobre a peça</summary>
          <div class="corpo">
            <p>${esc(p.descricao)}</p>
            <p><strong>Tecido:</strong> ${esc(p.tecido)}</p>
            <p><strong>Caimento:</strong> ${esc(p.caimento)}</p>
            <p><strong>Cuidados:</strong> ${esc(p.cuidados)}</p>
          </div>
        </details>
        <details id="guia-medidas">
          <summary>Guia de medidas</summary>
          <div class="corpo">${blocoMedidas()}</div>
        </details>
        <details>
          <summary>Entrega e trocas</summary>
          <div class="corpo">
            <p>Enviamos para todo o Brasil. Pedidos pagos até as 14h saem no mesmo dia útil.</p>
            <p>Primeira troca por nossa conta em até 30 dias — é só falar com a gente no WhatsApp.</p>
            <a class="link-seta" href="atendimento.html#entrega">Ver prazos e frete <span aria-hidden="true">→</span></a>
          </div>
        </details>
      </div>`;
  }

  /* ---------- eventos dos detalhes ---------- */
  function ligarEventos() {
    // cores
    document.getElementById("cores-escolha").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cor]");
      if (!btn) return;
      estado.cor = btn.dataset.cor;
      document.getElementById("cor-valor").textContent = estado.cor;
      this.querySelectorAll("[data-cor]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
    });

    // tamanhos
    document.getElementById("tamanhos").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-tamanho]");
      if (!btn || btn.disabled) return;
      estado.tamanho = btn.dataset.tamanho;
      document.getElementById("tam-valor").textContent =
        p.tipoTamanho === "unico" ? "Único" : estado.tamanho;
      this.querySelectorAll("[data-tamanho]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      atualizarAviso();
    });

    // aviso de estoque
    function atualizarAviso() {
      var el = document.getElementById("aviso-estoque");
      if (esgotado) return;
      if (!estado.tamanho) {
        el.className = "aviso-estoque";
        el.lastElementChild.textContent = "Selecione o tamanho para ver a disponibilidade";
        return;
      }
      var q = p.tamanhos[estado.tamanho];
      if (q === 0) {
        el.className = "aviso-estoque aviso-estoque--esgotado";
        el.lastElementChild.textContent = "Tamanho esgotado — escolha outro";
      } else if (q <= 3) {
        el.className = "aviso-estoque aviso-estoque--baixo";
        el.lastElementChild.textContent = "Últimas " + q + " peças neste tamanho";
      } else {
        el.className = "aviso-estoque";
        el.lastElementChild.textContent = "Pronta envio · " + q + " peças disponíveis";
      }
    }

    // quantidade
    var inputQtd = document.getElementById("qtd-input");
    function setQtd(v) {
      estado.qtd = Math.min(10, Math.max(1, v || 1));
      inputQtd.value = estado.qtd;
    }
    document.getElementById("qtd-menos").addEventListener("click", function () { setQtd(estado.qtd - 1); });
    document.getElementById("qtd-mais").addEventListener("click", function () { setQtd(estado.qtd + 1); });
    inputQtd.addEventListener("change", function () { setQtd(parseInt(inputQtd.value, 10)); });

    // comprar
    document.getElementById("btn-comprar").addEventListener("click", function () {
      if (esgotado) {
        toast("Pronto! Avisamos quando essa peça chegar.");
        return;
      }
      if (!estado.tamanho) {
        toast("Escolha um tamanho primeiro", "erro");
        var tam = document.getElementById("tamanhos");
        tam.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      Carrinho.adicionar(p, estado.tamanho, estado.cor, estado.qtd);
      toast("Adicionado à sacola");
    });

    // favorito
    var btnFav = document.getElementById("btn-favorito");
    btnFav.addEventListener("click", function () {
      var adicionado = Favoritos.alternar(p.id);
      btnFav.setAttribute("aria-pressed", String(adicionado));
      toast(adicionado ? "Adicionado aos favoritos" : "Removido dos favoritos");
    });

    // guia de medidas
    document.getElementById("btn-guia").addEventListener("click", function () {
      var d = document.getElementById("guia-medidas");
      d.open = true;
      d.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- sugestões ---------- */
  function montarSugestoes() {
    var mesmas = PRODUTOS.filter(function (x) {
      return x.categoria === p.categoria && x.id !== p.id;
    });
    var outras = PRODUTOS.filter(function (x) {
      return x.categoria !== p.categoria && x.id !== p.id;
    });
    var lista = mesmas.concat(outras).slice(0, 4);
    elSugestoes.innerHTML = lista.map(cardProduto).join("");
    ligarFavoritos(elSugestoes);
  }

  /* ---------- início ---------- */
  montarGaleria();
  montarDetalhe();
  ligarEventos();
  montarSugestoes();
})();
