document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://script.google.com/macros/s/AKfycbz5l3NkqcfJ2XOaOJw3GRyvkUpptmOM6EpnnisvUzlYOcA_4d4IdGp_X2ZNH8Ozu2osQw/exec"; // Pega aquí la URL del Apps Script

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
      const btn = document.createElement("button");
      btn.textContent = est.titulo;
      btn.onclick = () => mostrarTemas(est);
      container.appendChild(btn);
    });
  }

  function mostrarTemas(estudio) {
    descripcion.innerHTML = `<h2>${estudio.titulo}</h2>`;
    container.innerHTML = "";

    estudio.temas.forEach((tema, index) => {
      const btn = document.createElement("button");
      btn.textContent = `${index + 1}.- ${tema.titulo}`;
      btn.onclick = () => window.open(tema.url, "_blank");
      container.appendChild(btn);
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
          btn.onclick = () => window.open(tema.url, "_blank");
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

  // Al iniciar
  activarMenu(btnEstudios);
  cargarDatos(mostrarEstudios);
});

