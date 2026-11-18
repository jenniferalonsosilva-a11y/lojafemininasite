/* Aurora — atendimento: formulário de contato */
(function () {
  "use strict";

  var form = document.getElementById("form-contato");
  if (!form) return;

  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nome = form.nome.value.trim();
    var email = form.email.value.trim();
    var msg = form.mensagem.value.trim();

    status.hidden = false;

    if (!nome || !msg) {
      status.style.color = "var(--vinho)";
      status.textContent = "Preencha seu nome e a mensagem para enviar.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.style.color = "var(--vinho)";
      status.textContent = "Digite um e-mail válido para a gente responder.";
      form.email.focus();
      return;
    }

    status.style.color = "var(--oliva-esc)";
    status.textContent = "Mensagem enviada! Respondemos em até 1 dia útil — obrigada, " + nome + ".";
    form.reset();
    toast("Mensagem enviada com sucesso");
  });
})();
