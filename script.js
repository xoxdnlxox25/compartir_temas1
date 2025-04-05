document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwaw60UOlVXT9pfv2PXwqoO5650WV7nnSNTYfDWAnmiyEWu3k7zGpQYlAUfmfbzXmdW/exec";

  const container = document.getElementById("botones-container");
  const descripcion = document.getElementById("descripcion");
  const btnEstudios = document.getElementById("btn-estudios");
  const btnRespuestas = document.getElementById("btn-respuestas");
  const menuLinks = document.querySelectorAll("#menu-lateral a");

  // 👉 Lógica de botones (Estudios)
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        let button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-book"></i> ${item.nombre}`;


        button.onclick = () => {
          let mensaje = `📌 *${item.nombre}*%0A📖 ${item.descripcion}`;
          let urlWhatsApp = `https://api.whatsapp.com/send?text=${mensaje}`;
          window.open(urlWhatsApp, "_blank");
        };

        container.appendChild(button);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los datos:", error);
    });

  // 👉 Función para activar el menú visualmente
  function activarMenu(actual) {
    menuLinks.forEach(link => link.classList.remove("active"));
    actual.classList.add("active");
  }

  // 👉 Mostrar botones (Estudios)
  btnEstudios.addEventListener("click", function (e) {
    e.preventDefault();
    container.style.display = "flex";
    descripcion.textContent = "LUMBRERA PLUS 2025"; // Limpia cualquier contenido de respuestas
    activarMenu(this);
  });

  // 👉 Ocultar botones y mostrar algo (Respuestas)
  btnRespuestas.addEventListener("click", function (e) {
    e.preventDefault();
    container.style.display = "none";
    descripcion.textContent = "Aquí aparecerán las respuestas o el contenido relacionado."; // o lo que quieras mostrar
    activarMenu(this);
  });

  // 👉 Activar "Estudios" por defecto al cargar
  activarMenu(btnEstudios);
});
