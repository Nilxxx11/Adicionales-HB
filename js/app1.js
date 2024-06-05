// Importar los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, push, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRj_XERD1UGa8RhKG5CZ589yr21D0w37w",
  authDomain: "adicionales-3d645.firebaseapp.com",
  projectId: "adicionales-3d645",
  storageBucket: "adicionales-3d645.appspot.com",
  messagingSenderId: "1072268348737",
  appId: "1:1072268348737:web:f6dbc542496a24a8d7a5c0",
  databaseURL: "https://adicionales-3d645-default-rtdb.firebaseio.com/"  // Asegúrate de incluir el URL de tu Realtime Database
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// la otra sección
document.getElementById('seccionButton').addEventListener('click', function() {
  window.location.href = 'detalles.html';
});
document.getElementById('seccionButton1').addEventListener('click', function() {
  window.location.href = 'main.html';
});


// Función para consultar conductores por documento
window.consultarConductor = async function() {
  const documentoConductor = document.getElementById('documentoConductor').value.trim();
  if (documentoConductor === "") {
    alert("Por favor ingrese el documento del conductor.");
    return;
  }

  const dbRef = ref(database);
  const q = query(dbRef, orderByChild('DOCUMENTO'), equalTo(documentoConductor));

  try {
    console.log("Realizando consulta para documento:", documentoConductor);
    const snapshot = await get(q);
    console.log("Respuesta de la consulta:", snapshot.val()); // Depuración
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = ''; // Limpiar resultados previos

    if (snapshot.exists()) {
      const aggregatedData = {};

      // Agrupar y sumar los datos, omitiendo los de tipo 'RE'
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.TIPO === 'RE') return; // Omitir registros de tipo 'RE'

        const key = `${data.FECHA}-${data.TIPO}`;
        const nombreConductor = data.CONDUCTOR;

        if (!aggregatedData[key]) {
          aggregatedData[key] = { nombre: nombreConductor, fecha: data.FECHA, tipo: data.TIPO, total: 0 };
        }
        aggregatedData[key].total += data.CANTIDAD;
      });

      // Generar la tabla
      let tableHTML = `
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const key in aggregatedData) {
        const item = aggregatedData[key];
        tableHTML += `
          <tr>
            <td>${item.nombre}</td>
            <td>${item.fecha}</td>
            <td>${item.tipo}</td>
            <td>${item.total}</td>
          </tr>
        `;
      }

      tableHTML += `
          </tbody>
        </table>
      `;

      resultadosDiv.innerHTML = tableHTML;
    } else {
      resultadosDiv.innerHTML = '<p>No se encontraron datos para el documento especificado.</p>';
    }
  } catch (error) {
    console.error("Error al consultar los datos:", error.message); // Mostrar el mensaje de error específico
    document.getElementById('resultados').innerText = 'Error al consultar los datos.';
  }
};
