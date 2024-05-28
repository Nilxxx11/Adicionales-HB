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

// Función para insertar datos iniciales
async function insertarDatosIniciales() {
  try {
    await push(ref(database), {
      documento: "123456",
      CONDUCTOR: "John Doe",
      Fecha: "2024-05-27",
      Empresa: "HB Y CIA S.A.S",
      Ruta: "Ruta 1",
      Tipo: "Tipo 1",
      Cantidad: 1,
      Placa: "ABC123"
    });

    await push(ref(database), {
      documento: "789012",
      CONDUCTOR: "Jane Doe",
      Fecha: "2024-05-28",
      Empresa: "HB Y CIA S.A.S",
      Ruta: "Ruta 2",
      Tipo: "Tipo 2",
      Cantidad: 2,
      Placa: "XYZ789"
    });

    console.log("Datos iniciales insertados correctamente");
  } catch (error) {
    console.error("Error al insertar datos iniciales:", error);
  }
}

// ...

// Función para consultar conductores por documento
window.consultarConductor = async function() {
  const documentoConductor = document.getElementById('documentoConductor').value.trim();
  if (documentoConductor === "") {
    alert("Por favor ingrese el documento del conductor.");
    return;
  }

  const dbRef = ref(database);
  const q = query(dbRef, orderByChild('documento'), equalTo(documentoConductor));

  try {
    console.log("Realizando consulta para documento:", documentoConductor);
    const snapshot = await get(q);
    console.log("Respuesta de la consulta:", snapshot.val()); // Depuración
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = ''; // Limpiar resultados previos

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        resultadosDiv.innerHTML += `<p>Fecha: ${data.Fecha}, Tipo: ${data.Tipo}, Cantidad: ${data.Cantidad}</p>`;
      });
    } else {
      resultadosDiv.innerHTML = '<p>No se encontraron datos para el documento especificado.</p>';
    }
  } catch (error) {
    console.error("Error al consultar los datos:", error.message); // Mostrar el mensaje de error específico
    document.getElementById('resultados').innerText = 'Error al consultar los datos.';
  }
};

// ...


// Insertar datos iniciales al cargar la página
window.onload = insertarDatosIniciales;
