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
    } else {
      mostrarMsg(`❌ Erro: ${resultado.detail}`, false);
    }
  } catch (erro) {
    console.error(erro);
    mostrarMsg("❌ Erro ao conectar com o servidor.", false);
  }
}

function mostrarMsg(texto, sucesso) {
  const msg = document.getElementById("msg");
  msg.innerHTML = texto;
  msg.className = sucesso ? "text-green-600" : "text-red-600";
}