document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://script.google.com/macros/s/AKfycbz5l3NkqcfJ2XOaOJw3GRyvkUpptmOM6EpnnisvUzlYOcA_4d4IdGp_X2ZNH8Ozu2osQw/exec";

  const container = document.getElementById("botones-container");
  const descripcion = document.getElementById("descripcion");
  const btnEstudios = document.getElementById("btn-estudios");
  const btnRespuestas = document.getElementById("btn-respuestas");
  const menuLinks = document.querySelectorAll(".opcion-menu");

  let estudios = [];

  function cargarDatos(callback) {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        estudios = data;
        if (typeof callback === "function") callback();
      })
      .catch(err => {
        descripcion.innerHTML = "❌ Error al cargar datos.";
        console.error(err);
      });
  }

  function mostrarEstudios() {
    descripcion.innerHTML = "<h2>Estudios disponibles</h2>";
    container.innerHTML = "";

    estudios.forEach(est => {
      const card = document.createElement("div");
      card.className = "card";

      const titulo = document.createElement("h3");
      titulo.textContent = est.titulo;

      const btn = document.createElement("button");
      btn.textContent = "Ver temas";
      btn.onclick = () => mostrarTemas(est);

      card.appendChild(titulo);
      card.appendChild(btn);

      container.appendChild(card);
    });
  }

  function mostrarTemas(estudio) {
    descripcion.innerHTML = `<h2>${estudio.titulo}</h2>`;
    container.innerHTML = "";

    estudio.temas.forEach((tema, index) => {
      const card = document.createElement("div");
      card.className = "card";

      const titulo = document.createElement("h3");
      titulo.textContent = `${index + 1}. ${tema.titulo}`;

      const botonesDiv = document.createElement("div");
      botonesDiv.className = "card-buttons";

      const btnVer = document.createElement("button");
      btnVer.textContent = "Ver";
      btnVer.onclick = () => {
        window.open(tema.url, "_blank");
      };

      const btnCompartir = document.createElement("button");
      btnCompartir.textContent = "Compartir";
      btnCompartir.onclick = () => {
        const mensaje = `📖 *${tema.titulo}*%0A🔗 ${tema.url}`;
        const enlaceWhatsApp = `https://api.whatsapp.com/send?text=${mensaje}`;
        window.open(enlaceWhatsApp, "_blank");
      };

      botonesDiv.appendChild(btnVer);
      botonesDiv.appendChild(btnCompartir);

      card.appendChild(titulo);
      card.appendChild(botonesDiv);

      container.appendChild(card);
    });

    const volverBtn = document.createElement("button");
    volverBtn.textContent = "← Volver";
    volverBtn.className = "volver-btn";
    volverBtn.onclick = mostrarEstudios;
    container.appendChild(volverBtn);
  }

  function mostrarTodasLasRespuestas() {
    descripcion.innerHTML = "<h2>Respuestas disponibles</h2>";
    container.innerHTML = "";

    let total = 1;

    estudios.forEach(est => {
      est.temas.forEach(tema => {
        if (tema.titulo && tema.url) {
          const btn = document.createElement("button");
          btn.textContent = `${total++}.- ${tema.titulo}`;
          btn.onclick = () => {
            const mensaje = `📖 *${tema.titulo}*%0A🔗 ${tema.url}`;
            const enlaceWhatsApp = `https://api.whatsapp.com/send?text=${mensaje}`;
            window.open(enlaceWhatsApp, "_blank");
          };
          container.appendChild(btn);
        }
      });
    });

    if (total === 1) {
      container.innerHTML = "<p>No hay respuestas disponibles.</p>";
    }
  }

  function activarMenu(actual) {
    menuLinks.forEach(link => link.classList.remove("active"));
    actual.classList.add("active");
  }

  // Eventos del menú
  btnEstudios.addEventListener("click", function (e) {
    e.preventDefault();
    activarMenu(this);
    mostrarEstudios();
  });

  btnRespuestas.addEventListener("click", function (e) {
    e.preventDefault();
    activarMenu(this);
    mostrarTodasLasRespuestas();
  });

  // 🌙 Modo claro/oscuro
  const toggleTema = document.getElementById("toggle-tema");
  const cuerpo = document.body;

  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "claro") {
    cuerpo.classList.add("tema-claro");
    toggleTema.checked = true;
  }

  toggleTema.addEventListener("change", () => {
    if (toggleTema.checked) {
      cuerpo.classList.add("tema-claro");
      localStorage.setItem("tema", "claro");
    } else {
      cuerpo.classList.remove("tema-claro");
      localStorage.setItem("tema", "oscuro");
    }
  });

  activarMenu(btnEstudios);
  cargarDatos(mostrarEstudios);
});
