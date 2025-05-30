const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1377845855574556753/Miv-HQ4GBe1SfoXkHJkZ3piQNW_WYTHA09rr9tMqgUnizt47sZG8QdN-pZJMtYxFIHiS";

async function enviarCheckout() {
  const nome = document.getElementById("nome").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const cursosSelecionados = Array.from(document.querySelectorAll("input[name='curso']:checked")).map(el => parseInt(el.value));

  if (!nome || !whatsapp || cursosSelecionados.length === 0) {
    mostrarMsg("Preencha todos os campos e selecione ao menos um curso.", false);
    return;
  }

  const payload = { nome, whatsapp, cursos: cursosSelecionados };

  try {
    const resposta = await fetch("https://matriculaapimp.onrender.com/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mostrarMsg(`✅ Matrícula realizada! Login: <strong>${resultado.usuario}</strong>`, true);
      await enviarLogDiscord(`✅ Matrícula realizada com sucesso para: **${nome}** | Usuário: **${resultado.usuario}**`);
      if (resultado.mp_link) {
        setTimeout(() => {
          window.location.href = resultado.mp_link;
        }, 2000);
      }
    } else {
      mostrarMsg(`❌ Erro: ${resultado.detail}`, false);
      await enviarLogDiscord(`❌ Falha na matrícula para: **${nome}** | Erro: ${resultado.detail}`);
    }
  } catch (erro) {
    console.error(erro);
    mostrarMsg("❌ Erro ao conectar com o servidor.", false);
    await enviarLogDiscord(`❌ Erro ao conectar com o servidor para: **${nome}** | Erro: ${erro.message}`);
  }
}

function mostrarMsg(texto, sucesso) {
  const msg = document.getElementById("msg");
  msg.innerHTML = texto;
  msg.className = sucesso ? "text-green-600" : "text-red-600";
}

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
