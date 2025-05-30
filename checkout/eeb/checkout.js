// checkout.js - Versão revisada para envio seguro, logs e validações

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1377845855574556753/Miv-HQ4GBe1SfoXkHJkZ3piQNW_WYTHA09rr9tMqgUnizt47sZG8QdN-pZJMtYxFIHiS";

async function enviarCheckout() {
  // Captura e validação dos dados do formulário
  const nome = document.getElementById("nome").value.trim();

  // Limpeza do WhatsApp para números apenas (evita erros na API)
  const whatsappRaw = document.getElementById("whatsapp").value.trim();
  const whatsapp = whatsappRaw.replace(/\D/g, '');

  // Captura dos cursos selecionados, convertendo para inteiros
  const cursosSelecionados = Array.from(document.querySelectorAll("input[name='curso']:checked"))
    .map(el => parseInt(el.value));

  // Valida se campos obrigatórios estão preenchidos
  if (!nome || !whatsapp || cursosSelecionados.length === 0) {
    mostrarMsg("Preencha todos os campos e selecione ao menos um curso.", false);
    return;
  }

  const payload = { nome, whatsapp, cursos: cursosSelecionados };

  console.log("Payload enviado:", payload); // Debug no console

  try {
    const resposta = await fetch("https://matriculaapimp.onrender.com/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    console.log("Resposta da API:", resultado); // Debug no console

    if (resposta.ok) {
      mostrarMsg(`✅ Matrícula realizada! Login: <strong>${resultado.usuario}</strong>`, true);

      await enviarLogDiscord(`✅ Matrícula realizada com sucesso para: **${nome}** | Usuário: **${resultado.usuario}**`);

      if (resultado.mp_link) {
        setTimeout(() => {
          window.location.href = resultado.mp_link;
        }, 2000);
      }
    } else {
      // Extrai mensagem de erro com fallback
      const erroMsg = resultado.detail || resultado.message || JSON.stringify(resultado);
      mostrarMsg(`❌ Erro: ${erroMsg}`, false);
      await enviarLogDiscord(`❌ Falha na matrícula para: **${nome}** | Erro: ${erroMsg}`);
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    mostrarMsg("❌ Erro ao conectar com o servidor.", false);
    await enviarLogDiscord(`❌ Erro ao conectar com o servidor para: **${nome}** | Erro: ${erro.message}`);
  }
}

// Função para exibir mensagens ao usuário
function mostrarMsg(texto, sucesso) {
  const msg = document.getElementById("msg");
  msg.innerHTML = texto;
  msg.className = sucesso ? "text-green-600" : "text-red-600";
}

// Função para enviar logs para Discord
async function enviarLogDiscord(mensagem) {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: mensagem })
    });
  } catch (err) {
    console.error("Falha ao enviar log para Discord:", err);
  }
}
