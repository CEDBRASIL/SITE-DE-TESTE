const API_BASE = "https://api.cedbrasilia.com.br";

document.addEventListener("DOMContentLoaded", () => listarCursos());

function listarCursos() {
  fetch(API_BASE + "/cursos")
    .then(res => res.json())
    .then(json => {
      const container = document.getElementById("cursosContainer");
      container.innerHTML = "";

      // Verifique se a API retorna um objeto com "cursos" como array ou objeto
      const cursos = Array.isArray(json.cursos) ? json.cursos : Object.values(json.cursos);

      cursos.forEach(curso => {
        // Ajuste para usar o id real do curso, se existir
        const idCurso = curso.id || curso.codigo || curso.nome || curso;
        const nomeCurso = curso.nome || curso.titulo || curso;

        const inputId = "curso-" + idCurso.toString().replace(/\s+/g, "-").toLowerCase();

        container.insertAdjacentHTML(
          "beforeend",
          `<label><input type="checkbox" name="cursos" value="${idCurso}" id="${inputId}"> ${nomeCurso}</label><br>`
        );
      });
    })
    .catch(() => {
      document.getElementById("cursosContainer").textContent = "Erro ao carregar cursos.";
    });
}

document.getElementById("matriculaForm").addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim().replace(/\D/g, "");
  const cursos = Array.from(document.querySelectorAll("input[name='cursos']:checked")).map(c => c.value);

  if (!nome || !email || !whatsapp || cursos.length === 0) {
    alert("Preencha todos os campos e selecione ao menos um curso.");
    return;
  }

  if (!/^[0-9]{10,11}$/.test(whatsapp)) {
    alert("Por favor, insira um número de WhatsApp válido.");
    return;
  }

  const submitButton = document.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Processando...";

  fetch(API_BASE + "/pay/eeb/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      whatsapp,
      cursos
    })
  })
    .then(res => res.json())
    .then(json => {
      if (json.mp_link) {
        window.location.href = json.mp_link;
      } else {
        alert(json.detail || "Falha ao gerar link de pagamento.");
      }
    })
    .catch(() => alert("Erro de comunicação com o servidor."))
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "Prosseguir para pagamento";
    });
});
