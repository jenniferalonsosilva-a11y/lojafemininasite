/* Aurora — sacola: itens, quantidades, cupom, frete e checkout simulado */
(function () {
  "use strict";

  var FRETE_GRATIS = 299;
  var cupomAtivo = null;          // null ou 'AURORA10'
  var frete = null;               // { valor, prazo, cep }

  var elLista = document.getElementById("carrinho-lista");
  var elVazio = document.getElementById("carrinho-vazio");
  var elLayout = document.getElementById("carrinho-layout");
  var elOk = document.getElementById("pedido-ok");

  /* ---------- cálculos ---------- */
  function subtotal() { return Carrinho.total(); }

  function desconto() {
    if (cupomAtivo === "AURORA10") return subtotal() * 0.10;
    return 0;
  }

  function valorFrete() {
    if (!frete) return null;
    if (subtotal() >= FRETE_GRATIS) return 0;
    return frete.valor;
  }

  function total() {
    return Math.max(0, subtotal() - desconto() + (valorFrete() || 0));
  }

  /* ---------- render dos itens ---------- */
  function itemHTML(i) {
    var p = acharProduto(i.id);
    var href = p ? "produto.html?id=" + encodeURIComponent(i.id) : "#";
    return `
      <article class="item-carrinho" data-chave="${esc(i.chave)}">
        <a href="${href}"><img src="${i.img}" alt="${esc(i.nome)}" width="96" height="128"></a>
        <div class="item-corpo">
          <h2 class="item-nome"><a href="${href}">${esc(i.nome)}</a></h2>
          <p class="item-variantes">Tamanho ${esc(i.tamanho)} · ${esc(i.cor)}</p>
          <p class="item-variantes">${brl(i.preco)} a unidade</p>
          <div class="item-acoes">
            <div class="qtd" aria-label="Quantidade de ${esc(i.nome)}">
              <button type="button" data-menos aria-label="Diminuir">−</button>
              <input type="number" value="${i.qtd}" min="1" max="10" data-qtd aria-label="Quantidade">
              <button type="button" data-mais aria-label="Aumentar">+</button>
            </div>
            <button type="button" class="item-remover" data-remover>Remover</button>
          </div>
        </div>
        <div class="item-dir">
          <span class="item-subtotal">${brl(i.preco * i.qtd)}</span>
        </div>
      </article>`;
  }

  function renderItens() {
    var itens = Carrinho.itens();
    var vazio = itens.length === 0;
    elVazio.hidden = !vazio;
    elLayout.hidden = vazio;
    if (vazio) { elOk.hidden = true; return; }
    elLista.innerHTML = itens.map(itemHTML).join("");
  }

  function renderResumo() {
    var itens = Carrinho.itens();
    var qtd = Carrinho.quantidade();
    document.getElementById("resumo-qtd").textContent = qtd;
    document.getElementById("resumo-subtotal").textContent = brl(subtotal());

    var linhaDesc = document.getElementById("linha-desconto");
    linhaDesc.hidden = desconto() === 0;
    document.getElementById("resumo-desconto").textContent = "− " + brl(desconto());

    var freteV = valorFrete();
    document.getElementById("resumo-frete").textContent =
      freteV === null ? "calculado no CEP" : (freteV === 0 ? "Grátis" : brl(freteV));

    document.getElementById("resumo-total").textContent = brl(total());

    var info = document.getElementById("frete-info");
    if (subtotal() >= FRETE_GRATIS) {
      info.textContent = "Frete grátis liberado neste pedido.";
    } else if (frete) {
      info.textContent = "Faltam " + brl(FRETE_GRATIS - subtotal()) + " para o frete grátis.";
    } else {
      info.textContent = "Informe o CEP para calcular o frete e o prazo.";
    }

    // libera finalização apenas com itens
    document.getElementById("btn-checkout").disabled = itens.length === 0;
  }

  function render() {
    renderItens();
    renderResumo();
  }

  /* ---------- eventos da lista ---------- */
  elLista.addEventListener("click", function (e) {
    var artigo = e.target.closest(".item-carrinho");
    if (!artigo) return;
    var chave = artigo.dataset.chave;
    var item = Carrinho.itens().find(function (i) { return i.chave === chave; });
    if (!item) return;

    if (e.target.closest("[data-menos]")) {
      Carrinho.atualizar(chave, item.qtd - 1);
      render();
    } else if (e.target.closest("[data-mais]")) {
      Carrinho.atualizar(chave, item.qtd + 1);
      render();
    } else if (e.target.closest("[data-remover]")) {
      Carrinho.remover(chave);
      toast("Item removido da sacola");
      render();
    }
  });

  elLista.addEventListener("change", function (e) {
    if (!e.target.matches("[data-qtd]")) return;
    var artigo = e.target.closest(".item-carrinho");
    var chave = artigo.dataset.chave;
    Carrinho.atualizar(chave, parseInt(e.target.value, 10));
    render();
  });

  /* ---------- frete ---------- */
  var inputCep = document.getElementById("frete-cep");

  inputCep.addEventListener("input", function () {
    var v = inputCep.value.replace(/\D/g, "").slice(0, 8);
    inputCep.value = v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v;
  });

  document.getElementById("frete-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var digitos = inputCep.value.replace(/\D/g, "");
    var elRes = document.getElementById("frete-resultado");
    elRes.hidden = false;

    if (digitos.length !== 8) {
      elRes.textContent = "Digite um CEP completo com 8 dígitos.";
      elRes.style.color = "var(--vinho)";
      frete = null;
      renderResumo();
      return;
    }

    var regiao = parseInt(digitos[0], 10);
    if (regiao <= 5) {
      frete = { valor: 19.90, prazo: "3 a 5 dias úteis", cep: inputCep.value };
    } else {
      frete = { valor: 24.90, prazo: "5 a 8 dias úteis", cep: inputCep.value };
    }

    var gratis = subtotal() >= FRETE_GRATIS;
    elRes.style.color = "var(--oliva-esc)";
    elRes.innerHTML = "CEP " + esc(inputCep.value) + " · " +
      (gratis ? "frete grátis" : brl(frete.valor)) + " · entrega em " + frete.prazo;
    renderResumo();
  });

  /* ---------- cupom ---------- */
  document.getElementById("cupom-btn").addEventListener("click", function () {
    var codigo = document.getElementById("cupom-input").value.trim().toUpperCase();
    var elMsg = document.getElementById("cupom-msg");
    elMsg.hidden = false;

    if (codigo === "AURORA10") {
      cupomAtivo = "AURORA10";
      elMsg.style.color = "var(--oliva-esc)";
      elMsg.textContent = "Cupom aplicado: 10% de desconto.";
    } else {
      cupomAtivo = null;
      elMsg.style.color = "var(--vinho)";
      elMsg.textContent = "Cupom inválido. Tente AURORA10.";
    }
    renderResumo();
  });

  /* ---------- checkout simulado ---------- */
  document.getElementById("btn-checkout").addEventListener("click", function () {
    var itens = Carrinho.itens();
    if (!itens.length) return;

    if (!frete) {
      toast("Informe o CEP para calcular o frete", "erro");
      inputCep.focus();
      inputCep.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var numero = String(Math.floor(10000 + Math.random() * 90000));
    var prazo = frete.prazo;
    document.getElementById("pedido-texto").innerHTML =
      "Pedido <strong>#AUR" + numero + "</strong> confirmado no valor de <strong>" +
      brl(total()) + "</strong>.<br>Entrega estimada em " + esc(prazo) +
      " para o CEP " + esc(frete.cep) + ".";

    Carrinho.limpar();
    cupomAtivo = null;
    frete = null;
    UI.atualizarContador();

    elLayout.hidden = true;
    elVazio.hidden = true;
    elOk.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- início ---------- */
  render();
})();
