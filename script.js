// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqfOyFpqVUei-GPduRlRN07C4N6w9SbZc",
  authDomain: "myapp-5474e.firebaseapp.com",
  databaseURL: "https://myapp-5474e-default-rtdb.firebaseio.com",
  projectId: "myapp-5474e",
  storageBucket: "myapp-5474e.appspot.com",
  messagingSenderId: "668078766089",
  appId: "1:668078766089:web:c866a1857edb4c254f60d8"
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos del DOM
const buscarBtn = document.getElementById("buscarBtn");
const documentoInput = document.getElementById("documento");
const resultados = document.getElementById("resultados");
// Elementos del CSV
const subirCSVBtn = document.getElementById("subirCSVBtn");
const archivoCSVInput = document.getElementById("archivoCSV");

// Función para leer y procesar el archivo CSV
subirCSVBtn.addEventListener("click", () => {
  const archivo = archivoCSVInput.files[0]; // Obtener el archivo CSV seleccionado

  if (!archivo) {
    alert("Por favor, selecciona un archivo CSV.");
    return;
  }

  // Crear un FileReader para leer el archivo
  const reader = new FileReader();

  // Definir lo que sucede cuando el archivo se ha leído
  reader.onload = function (event) {
    const contenido = event.target.result; // Contenido del archivo CSV
    const filas = contenido.split("\n"); // Separar el contenido en filas

    // Procesar las filas del CSV
    const encabezado = filas[0].split(","); // Primera fila de encabezado
    const documentoIdx = encabezado.indexOf("documento"); // Índice de la columna "documento"
    const totalIdx = encabezado.indexOf("total"); // Índice de la columna "total"

    if (documentoIdx === -1 || totalIdx === -1) {
      alert('No se encontraron las columnas "documento" o "total" en el archivo CSV.');
      return;
    }

    // Procesar cada fila del CSV
    filas.forEach((fila, index) => {
      if (index === 0 || !fila.trim()) return; // Saltar la fila de encabezado o filas vacías

      const datos = fila.split(","); // Separar las columnas por coma

      if (datos.length < encabezado.length) return; // Ignorar filas incompletas

      const documento = datos[documentoIdx]; // Obtener el valor de la columna "documento"
      const total = parseFloat(datos[totalIdx]); // Obtener el valor de la columna "total"

      const ejemploData = {
        nombre: datos[1], // Suponemos que el nombre está en la segunda columna
        camioneta: datos[2], // Camioneta en la tercera columna
        diurnos: parseInt(datos[3], 10), // Diurnos en la cuarta columna
        nocturnos: parseInt(datos[4], 10), // Nocturnos en la quinta columna
        retroactivo: parseFloat(datos[5]), // Retroactivo en la sexta columna
        ta: parseFloat(datos[6]), // TA en la séptima columna
        tac: parseFloat(datos[7]), // TAC en la octava columna
        tadn: parseFloat(datos[8]), // TADN en la novena columna
        total: total // Usar el valor de la columna "total" del CSV
      };

      // Subir los datos a Firebase bajo la clave del documento
      const dbRef = ref(db, 'datos/' + documento);
      set(dbRef, ejemploData)
        .then(() => {
          console.log("Datos del documento " + documento + " subidos correctamente.");
        })
        .catch((error) => {
          console.error("Error al subir los datos del documento " + documento + ":", error);
        });
    });

    alert("Archivo CSV procesado y datos cargados correctamente.");
  };

  // Leer el archivo como texto
  reader.readAsText(archivo);
});


// Función para buscar y mostrar resultados
buscarBtn.addEventListener("click", () => {
  const documento = documentoInput.value;

  if (!documento) {
    alert("Por favor, ingrese un número de documento");
    return;
  }

  // Referencia a la base de datos
  const dbRef = ref(db);

  // Buscar en la base de datos
  get(child(dbRef, `datos/${documento}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        mostrarResultados(data);
      } else {
        alert("No se encontró información para este documento.");
        resultados.innerHTML = "";
      }
    })
    .catch((error) => {
      console.error("Error al consultar la base de datos:", error);
    });
});

// Función para mostrar los resultados en la tabla
function mostrarResultados(data) {
  resultados.innerHTML = `
    <tr>
      <td>${data.nombre}</td>
      <td>${data.camioneta}</td>
      <td>${data.diurnos}</td>
      <td>${data.nocturnos}</td>
      <td>${data.retroactivo}</td>
      <td>${data.ta}</td>
      <td>${data.tac}</td>
      <td>${data.tadn}</td>
      <td>${data.total}</td>
    </tr>
  `;
}
// Función para enviar un ejemplo de prueba a Firebase
const enviarPruebaBtn = document.getElementById("enviarPruebaBtn");

enviarPruebaBtn.addEventListener("click", () => {
  // Crear un ejemplo de prueba
  const ejemploData = {
    nombre: "Juan Pérez",
    camioneta: "XYZ-123",
    diurnos: 5,
    nocturnos: 2,
    retroactivo: 100,
    ta: 200,
    tac: 300,
    tadn: 400,
    total: 1000
  };

  // Generar una clave única para el documento (puedes usar el número de documento o un ID aleatorio)
  const documentoPrueba = "123456789"; // Número de documento de prueba

  // Referencia a la base de datos
  const dbRef = ref(db, 'datos/' + documentoPrueba);

  // Enviar los datos a Firebase
  set(dbRef, ejemploData)
    .then(() => {
      alert("Ejemplo de prueba enviado correctamente.");
    })
    .catch((error) => {
      console.error("Error al enviar los datos:", error);
      alert("Hubo un error al enviar los datos.");
    });
});

