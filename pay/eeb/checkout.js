<script>
  const API_BASE = "https://api.cedbrasilia.com.br";

  async function listarCursos() {
    try {
      const response = await fetch(`${API_BASE}/cursos`);
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      const json = await response.json();
      const container = document.getElementById("cursosContainer");
      container.innerHTML = "";

      Object.keys(json.cursos).forEach(nome => {
        const id = "curso-" + nome.replace(/\s+/g, "-");
        container.insertAdjacentHTML("beforeend", `
          <label class="flex items-center space-x-2">
            <input type="checkbox" name="cursos" value="${nome}" id="${id}" class="form-checkbox text-green-500 rounded">
            <span>${nome}</span>
          </label>
        `);
      });
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      const container = document.getElementById("cursosContainer");
      container.innerHTML = "<p class='text-red-400'>Erro ao carregar cursos. Por favor, tente novamente mais tarde.</p>";
    }
  }

  document.addEventListener("DOMContentLoaded", listarCursos);
</script>
