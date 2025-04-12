document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwM0m3XYZSbwgTUgSQnnZbi-qgHeLjFoiF0gdp2PoPrBvlhAyEzhKClWzDxh2Gso6NkyA/exec"; // Reemplaza con tu URL real

  const container = document.getElementById("botones-container");
  const descripcion = document.getElementById("descripcion");
  const btnEstudios = document.getElementById("btn-estudios");
  const btnRespuestas = document.getElementById("btn-respuestas");
  const menuLinks = document.querySelectorAll(".opcion-menu");

  let datos = {
    hoja1: [],
    hoja2: []
  };

  let temaGlobalURL = "";

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
        btnVer.onclick = () => {
          temaGlobalURL = tema.url;
          mostrarFilaCSV(tema.url, index, estudio.titulo, tema.titulo);
        };
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
      if (hoja !== "hoja2") botonesDiv.appendChild(btnCompartir);

      card.appendChild(titulo);
      card.appendChild(botonesDiv);
      container.appendChild(card);
    });

    const volverBtn = document.createElement("button");
    volverBtn.textContent = "← Volver";
    volverBtn.className = "volver-btn";
    volverBtn.onclick = () => {
      if (hoja === "hoja1") {
        mostrarEstudiosDesdeHoja("hoja1");
      } else {
        mostrarRespuestasDesdeHoja2();
      }
    };
    container.appendChild(volverBtn);
  }

  function mostrarFilaCSV(url, indexCSV, nombreEstudio = "", nombreTema = "") {
    descripcion.innerHTML = `
      ${nombreEstudio ? `<div><strong>📚 ${nombreEstudio}</strong></div>` : ""}
      ${nombreTema ? `<div><strong>📌 ${nombreTema}</strong></div>` : ""}
      <h2>🔍 Buscar respuestas</h2>
      <input type="text" id="buscador" placeholder="Buscar... 🔎" />
    `;
    container.innerHTML = "⏳ Cargando...";

    fetch(url)
      .then(response => response.text())
      .then(csv => {
        const lineas = csv.split("\n").map(l => l.trim()).filter(Boolean);
        const preguntas = parseCSVLine(lineas[1] || "");
        const respuestas = lineas.slice(3).map(l => parseCSVLine(l));
        container.innerHTML = "";

        const lista = document.createElement("div");
        lista.id = "lista-botones";
        container.appendChild(lista);

        respuestas.forEach((fila, i) => {
          const btn = document.createElement("button");
          btn.textContent = `${fila[0]?.trim() || "Pregunta"} - ${fila[1]?.trim() || "Respuesta"}`;
          btn.onclick = () => mostrarDetalleFila(fila, preguntas);
          lista.appendChild(btn);
        });

        const inputBuscador = document.getElementById("buscador");
        inputBuscador.addEventListener("input", function () {
          const filtro = this.value.toLowerCase();
          const botones = lista.querySelectorAll("button");
          botones.forEach(btn => {
            const texto = btn.textContent.toLowerCase();
            btn.style.display = texto.includes(filtro) ? "block" : "none";
          });
        });

        const volver = document.createElement("button");
        volver.textContent = "← Volver";
        volver.className = "volver-btn";
        volver.onclick = mostrarRespuestasDesdeHoja2;
        container.appendChild(volver);
      })
      .catch(err => {
        container.innerHTML = `<p>❌ Error al cargar el archivo CSV.</p>`;
        console.error(err);
      });
  }

  function mostrarDetalleFila(fila, preguntas) {
    descripcion.innerHTML = `<h2>📘 Detalle de la respuesta</h2>`;
    container.innerHTML = "";

    const datosPersonales = document.createElement("div");
    const tituloDatos = document.createElement("h3");
    tituloDatos.textContent = "👤 Información del participante";
    tituloDatos.style.textAlign = "center";
    tituloDatos.style.color = "#f1c40f";
    tituloDatos.style.marginBottom = "1rem";
    datosPersonales.appendChild(tituloDatos);

    for (let i = 0; i < fila.length; i++) {
      const preguntaOriginal = preguntas[i]?.trim() || `Pregunta ${i + 1}`;
      const pregunta = preguntaOriginal.toLowerCase();
      const respuesta = fila[i]?.trim() || "(sin respuesta)";

      if (pregunta.includes("teléfono") || pregunta.includes("telefono") || pregunta.includes("número telefónico")) {
        continue;
      }

      if (pregunta.includes("puntuación")) {
        const puntuacion = document.createElement("div");
        puntuacion.className = "detalle-puntuacion";
        puntuacion.textContent = respuesta;
        container.appendChild(puntuacion);
        continue;
      }

      const item = document.createElement("div");
      item.className = "detalle-item";

      const p = document.createElement("strong");
      p.textContent = preguntaOriginal;

      const r = document.createElement("p");
      r.textContent = respuesta;

      item.appendChild(p);
      item.appendChild(r);

      if (i <= 4) {
        datosPersonales.appendChild(item);
      } else {
        container.appendChild(item);
      }
    }

    container.prepend(datosPersonales);

    const volver = document.createElement("button");
    volver.textContent = "← Volver";
    volver.className = "volver-btn";
    volver.onclick = () => mostrarFilaCSV(temaGlobalURL, 0);
    container.appendChild(volver);
  }

  function mostrarRespuestasDesdeHoja2() {
    const estudios = datos.hoja2;
    descripcion.innerHTML = "<h2>Respuestas disponibles</h2>";
    container.innerHTML = "";

    estudios.forEach(est => {
      const card = document.createElement("div");
      card.className = "card";

      const titulo = document.createElement("h3");
      titulo.textContent = est.titulo;

      const btn = document.createElement("button");
      btn.textContent = "Ver temas";
      btn.onclick = () => mostrarTemas(est, "hoja2");

      card.appendChild(titulo);
      card.appendChild(btn);
      container.appendChild(card);
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
    mostrarRespuestasDesdeHoja2();
  });

  activarMenu(btnEstudios);
  cargarDatos(() => mostrarEstudiosDesdeHoja("hoja1"));

  function parseCSVLine(linea) {
    const resultado = [];
    let actual = '';
    let dentroComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      const siguiente = linea[i + 1];

      if (char === '"' && dentroComillas && siguiente === '"') {
        actual += '"';
        i++;
      } else if (char === '"') {
        dentroComillas = !dentroComillas;
      } else if (char === ',' && !dentroComillas) {
        resultado.push(actual);
        actual = '';
      } else {
        actual += char;
      }
    }

    resultado.push(actual);
    return resultado;
  }

  // 👥 Gestión de estudiantes
  const modal = document.getElementById("modal-estudiantes");
  const abrirModalBtn = document.getElementById("abrir-modal");
  const cerrarModalBtn = document.getElementById("cerrar-modal");
  const formEstudiante = document.getElementById("form-estudiante");
  const listaEstudiantes = document.getElementById("lista-estudiantes");
  const inputNombre = document.getElementById("nombre-estudiante");

  let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];

  function guardarEstudiantes() {
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
  }

  function renderizarEstudiantes() {
    listaEstudiantes.innerHTML = "";

    estudiantes.forEach((est, index) => {
      const div = document.createElement("div");
      div.className = "estudiante-item";

      const select = document.createElement("select");
      select.innerHTML = `<option value="">Selecciona un estudio</option>`;
      datos.hoja1.forEach(estudio => {
        estudio.temas.forEach(tema => {
          const titulo = `${estudio.titulo} - ${tema.titulo}`;
          select.innerHTML += `<option value="${tema.url}">${titulo}</option>`;
        });
      });

      const btnCompartir = document.createElement("button");
      btnCompartir.textContent = "📤 Compartir";
      btnCompartir.onclick = () => {
        const urlSeleccionado = select.value;
        if (!urlSeleccionado) {
          alert("⚠️ Debes seleccionar un estudio.");
          return;
        }

        const nombreEstudio = select.options[select.selectedIndex].text;
        const mensaje = `📖 Hola ${est.nombre}, aquí tienes un nuevo estudio bíblico:\n*${nombreEstudio}*\n🔗 ${urlSeleccionado}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");

        estudiantes[index].contador += 1;
        guardarEstudiantes();
        renderizarEstudiantes();
      };

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.className = "volver-btn";
      btnEliminar.onclick = () => {
        if (confirm("¿Eliminar este estudiante?")) {
          estudiantes.splice(index, 1);
          guardarEstudiantes();
          renderizarEstudiantes();
        }
      };

      div.innerHTML = `
        <strong>👤 ${est.nombre}</strong><br>
        🗓️ Registrado: ${est.fecha}<br>
        📊 Estudios compartidos: ${est.contador || 0}
      `;

      const botonesDiv = document.createElement("div");
      botonesDiv.className = "estudiante-botones";
      botonesDiv.appendChild(select);
      botonesDiv.appendChild(btnCompartir);
      botonesDiv.appendChild(btnEliminar);

      div.appendChild(botonesDiv);
      listaEstudiantes.appendChild(div);
    });
  }

  formEstudiante.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    if (!nombre) return;
    const fecha = new Date().toLocaleDateString();
    estudiantes.push({ nombre, fecha, contador: 0 });
    guardarEstudiantes();
    renderizarEstudiantes();
    inputNombre.value = "";
  });

  abrirModalBtn.onclick = () => {
    if (!datos.hoja1.length) {
      alert("Aún no se han cargado los estudios. Intenta de nuevo.");
      return;
    }
    modal.style.display = "flex";
    renderizarEstudiantes();
  };

  cerrarModalBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
