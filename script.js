document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwM0m3XYZSbwgTUgSQnnZbi-qgHeLjFoiF0gdp2PoPrBvlhAyEzhKClWzDxh2Gso6NkyA/exec";

  const container = document.getElementById("botones-container");
  const descripcion = document.getElementById("descripcion");
  const btnEstudios = document.getElementById("btn-estudios");
  const btnRespuestas = document.getElementById("btn-respuestas");
  const menuLinks = document.querySelectorAll(".opcion-menu");

  let datos = {
    hoja1: [],
    hoja2: []
  };

  function cargarDatos(callback) {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        datos = data;
        if (typeof callback === "function") callback();
      })
      .catch(err => {
        descripcion.innerHTML = "❌ Error al cargar datos.";
        console.error(err);
      });
  }

  function mostrarEstudiosDesdeHoja(hoja) {
    const estudios = datos[hoja];
    descripcion.innerHTML = "<h2>Estudios disponibles</h2>";
    container.innerHTML = "";

    estudios.forEach(est => {
      const card = document.createElement("div");
      card.className = "card";

      const titulo = document.createElement("h3");
      titulo.textContent = est.titulo;

      const btn = document.createElement("button");
      btn.textContent = "Ver temas";
      btn.onclick = () => mostrarTemas(est, hoja);

      card.appendChild(titulo);
      card.appendChild(btn);
      container.appendChild(card);
    });
  }

  function mostrarTemas(estudio, hoja) {
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

      if (hoja === "hoja2") {
        btnVer.onclick = () => mostrarCSV(tema.url, tema.titulo);
      } else {
        btnVer.onclick = () => window.open(tema.url, "_blank");
      }

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
    volverBtn.onclick = () => mostrarEstudiosDesdeHoja(hoja);
    container.appendChild(volverBtn);
  }

  function mostrarCSV(url, titulo) {
    descripcion.innerHTML = `<h2>${titulo}</h2>`;
    container.innerHTML = "⏳ Cargando contenido...";

    fetch(url)
      .then(response => response.text())
      .then(csv => {
        const lineasBrutas = csv.split("\n").map(l => l.trim()).filter(Boolean);
        const preguntas = lineasBrutas[1]?.split(",") || [];
        const lineas = lineasBrutas.slice(3);

        container.innerHTML = "";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "🔍 Buscar por palabra clave (columna A)...";
        input.style.padding = "0.7rem";
        input.style.marginBottom = "1rem";
        input.style.width = "90%";
        input.style.maxWidth = "400px";
        input.style.borderRadius = "8px";
        input.style.border = "1px solid #ccc";

        container.appendChild(input);

        const resultadosDiv = document.createElement("div");
        resultadosDiv.style.display = "flex";
        resultadosDiv.style.flexDirection = "column";
        resultadosDiv.style.gap = "0.5rem";
        container.appendChild(resultadosDiv);

        const filaCompletaDiv = document.createElement("div");
        filaCompletaDiv.style.marginTop = "2rem";
        container.appendChild(filaCompletaDiv);

        function filtrarResultados() {
          const filtro = input.value.toLowerCase();
          resultadosDiv.innerHTML = "";
          filaCompletaDiv.innerHTML = "";

          lineas.forEach((linea) => {
            const columnas = linea.split(",");
            const celdaA = columnas[0] || "";
            const celdaB = columnas[1] || "";

            if (celdaA.toLowerCase().includes(filtro)) {
              const btn = document.createElement("button");
              btn.textContent = `${celdaA.trim()} – ${celdaB.trim()}`;

              btn.onclick = () => {
                input.style.display = "none";
                resultadosDiv.style.display = "none";

                filaCompletaDiv.innerHTML = `<h3>📝 Cuestionario de "${celdaA}"</h3>`;

                for (let i = 0; i < columnas.length; i++) {
                  const pregunta = preguntas[i]?.trim() || `Pregunta ${i + 1}`;
                  const respuesta = columnas[i]?.trim() || "(sin respuesta)";

                  const preguntaEl = document.createElement("p");
                  preguntaEl.innerHTML = `<strong>${pregunta}</strong>`;
                  preguntaEl.style.marginBottom = "0.3rem";

                  const respuestaEl = document.createElement("p");
                  respuestaEl.textContent = respuesta;
                  respuestaEl.style.marginBottom = "1.2rem";
                  respuestaEl.style.paddingLeft = "10px";
                  respuestaEl.style.opacity = "0.9";

                  filaCompletaDiv.appendChild(preguntaEl);
                  filaCompletaDiv.appendChild(respuestaEl);
                }

                const volverBuscar = document.createElement("button");
                volverBuscar.textContent = "← Volver a buscar";
                volverBuscar.className = "volver-btn";
                volverBuscar.style.marginTop = "1.5rem";
                volverBuscar.onclick = () => {
                  input.style.display = "block";
                  resultadosDiv.style.display = "flex";
                  filaCompletaDiv.innerHTML = "";
                };
                filaCompletaDiv.appendChild(volverBuscar);
              };

              resultadosDiv.appendChild(btn);
            }
          });

          if (!resultadosDiv.hasChildNodes()) {
            resultadosDiv.innerHTML = "<p style='opacity:0.6'>Sin resultados.</p>";
          }
        }

        input.addEventListener("input", filtrarResultados);
        filtrarResultados();

        const volverBtn = document.createElement("button");
        volverBtn.textContent = "← Volver";
        volverBtn.className = "volver-btn";
        volverBtn.style.marginTop = "2rem";
        volverBtn.onclick = mostrarTodasLasRespuestas;
        container.appendChild(volverBtn);
      })
      .catch(error => {
        container.innerHTML = `<p>❌ Error al cargar el archivo CSV.</p>`;
        console.error("Error cargando CSV:", error);
      });
  }

  function mostrarTodasLasRespuestas() {
    descripcion.innerHTML = "<h2>Respuestas disponibles</h2>";
    container.innerHTML = "";

    let total = 1;
    const respuestas = datos.hoja2;

    if (!respuestas.length) {
      container.innerHTML = "<p>No hay respuestas disponibles.</p>";
      return;
    }

    respuestas.forEach(est => {
      est.temas.forEach((tema) => {
        const card = document.createElement("div");
        card.className = "card";

        const titulo = document.createElement("h3");
        titulo.textContent = `${total++}. ${tema.titulo}`;

        const botonesDiv = document.createElement("div");
        botonesDiv.className = "card-buttons";

        const btnVer = document.createElement("button");
        btnVer.textContent = "Ver";
        btnVer.onclick = () => mostrarCSV(tema.url, tema.titulo);

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
    });
  }

  function activarMenu(actual) {
    menuLinks.forEach(link => link.classList.remove("active"));
    actual.classList.add("active");
  }

  btnEstudios.addEventListener("click", function (e) {
    e.preventDefault();
    activarMenu(this);
    mostrarEstudiosDesdeHoja("hoja1");
  });

  btnRespuestas.addEventListener("click", function (e) {
    e.preventDefault();
    activarMenu(this);
    mostrarTodasLasRespuestas();
  });

  activarMenu(btnEstudios);
  cargarDatos(() => mostrarEstudiosDesdeHoja("hoja1"));
});
