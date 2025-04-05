document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwaw60UOlVXT9pfv2PXwqoO5650WV7nnSNTYfDWAnmiyEWu3k7zGpQYlAUfmfbzXmdW/exec"; // 👈 reemplaza esto con tu URL de Google Apps Script

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("botones-container");

      data.forEach((item) => {
        let button = document.createElement("button");
        button.textContent = item.nombre;

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
});
