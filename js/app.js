// Importar los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Constantes con los id de los botones y modal
const openModal = document.getElementById('nuevo');
const modal = document.getElementById('modal');
const cancel = document.getElementById('cancel');
const form = document.getElementById('register-form');

let countWithRif = 0;
let countWithGPS = 0;
let countWithCamera = 0;

// Variable global para almacenar la clave del registro que se está editando
let editKey = null;

// Función para mostrar modal
const showRegisterModal = () => {
    form.reset();
    editKey = null;
    modal.classList.toggle('is-active');
};

// Detecta los click a los botones y llaman a la función
openModal.addEventListener("click", showRegisterModal);
cancel.addEventListener("click", showRegisterModal);

// Función para manejar la edición de estudiantes
const handleEditStudent = (key) => {
    const studentRef = ref(getDatabase(), `/${key}`);

    get(studentRef)
        .then((snapshot) => {
            const student = snapshot.val();
            if (student) {
                form['documento'].value = student.documento;
                form['nombre'].value = student.nombre;
                form['diurnos'].value = student.diurnos;
                form['ta'].value = student.ta;
                form['nocturnos'].value = student.nocturnos;
                form['tadn'].value = student.tadn;
                form['retroactivo'].value = student.retroactivo;
                form['total'].value = student.total;

                editKey = key;
                modal.classList.add('is-active');
            } else {
                console.error('No se encontraron datos para el estudiante con la clave:', key);
            }
        })
        .catch((error) => {
            console.error('Error al obtener datos del estudiante: ', error);
        });
};

// Función para manejar la eliminación de estudiantes
const handleDeleteStudent = (key) => {
    const studentRef = ref(getDatabase(), `/${key}`);

    remove(studentRef)
        .then(() => {
            console.log('Estudiante eliminado correctamente');
            getStudentsSnapshot().then((students) => {
                renderStudents(students); // Actualiza la tabla
            }).catch((error) => {
                console.error('Error al obtener estudiantes: ', error);
            });
        })
        .catch((error) => {
            console.error('Error al eliminar estudiante: ', error);
        });
};

// Función para formatear números como moneda
const formatCurrency = (number) => {
    return `$${Number(number).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Función para manejar el envío del formulario
const handleFormSubmit = (e) => {
    e.preventDefault();

    const documento = form['documento'].value;
    const nombre = form['nombre'].value;
    const diurnos = form['diurnos'].value;
    const ta = form['ta'].value;
    const nocturnos = form['nocturnos'].value;
    const tadn = form['tadn'].value;
    const retroactivo = form['retroactivo'].value;
    const total = form['total'].value;

    const currentDate = new Date();
    const fecha = currentDate.toLocaleDateString();

    const estudiante = {
        documento,
        nombre,
        diurnos,
        ta,
        nocturnos,
        tadn,
        retroactivo,
        total
    };

    if (editKey) {
        update(ref(getDatabase(), `/${editKey}`), estudiante)
            .then(() => {
                console.log('Estudiante actualizado correctamente');
                editKey = null;
                modal.classList.remove('is-active');
                getStudentsSnapshot()
                    .then((students) => {
                        renderStudents(students);
                    })
                    .catch((error) => {
                        console.error('Error al obtener estudiantes: ', error);
                    });
            })
            .catch((error) => {
                console.error('Error al actualizar estudiante: ', error);
            });
    } else {
        const databaseRef = ref(getDatabase(), '/');
        get(databaseRef)
            .then((snapshot) => {
                const data = snapshot.val();
                const placasExistentes = data ? Object.values(data).map(item => item.documento) : [];
                if (placasExistentes.includes(documento)) {
                    alert('Esta placa ya está registrada.');
                } else {
                    push(databaseRef, estudiante)
                        .then(() => {
                            console.log('Estudiante añadido correctamente');
                            modal.classList.remove('is-active');
                            getStudentsSnapshot()
                                .then((students) => {
                                    renderStudents(students);
                                })
                                .catch((error) => {
                                    console.error('Error al obtener estudiantes: ', error);
                                });
                        })
                        .catch((error) => {
                            console.error('Error al añadir estudiante: ', error);
                        });
                }
            })
            .catch((error) => {
                console.error('Error al verificar la placa: ', error);
            });
    }
};

// Obtener una referencia a la base de datos
const databaseRef = ref(getDatabase());

// Función para renderizar los estudiantes en la tabla
const renderStudents = (students) => {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';

  countWithRif = 0;
  countWithGPS = 0;
  countWithCamera = 0;

  Object.entries(students).forEach(([key, student]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${student.documento}</td>
      <td>${student.nombre}</td>
      <td>${student.diurnos}</td>
      <td>${formatCurrency(student.ta)}</td>
      <td>${student.nocturnos}</td>
      <td>${formatCurrency(student.tadn)}</td>
      <td>${formatCurrency(student.retroactivo)}</td>
      <td>${formatCurrency(student.total)}</td>
      <td>
          <button class="button is-warning is-dark is-small" data-key="${key}">E</button>
        <button class="button is-danger is-dark is-small" data-key="${key}">X</button>
      </td>
    `;

        tbody.appendChild(tr);

        if (student.nombre === 'si') countWithRif++;
        if (student.diurnos === 'si') countWithGPS++;
        if (student.ta === 'si') countWithCamera++;
    });

    document.getElementById('rif-counter').innerText = `Con Rif: ${countWithRif}`;
    document.getElementById('gps-counter').innerText = `Con GPS: ${countWithGPS}`;
    document.getElementById('camera-counter').innerText = `Con Cámara: ${countWithCamera}`;
};


// Función para filtrar por documento
const filterStudentsByPlaca = (students, searchText) => {
  const filteredStudents = {};

  Object.entries(students).forEach(([key, student]) => {
    if (student.documento.toLowerCase().includes(searchText.toLowerCase())) {
      filteredStudents[key] = student;
    }
  });

  return filteredStudents;
};

// Función para obtener el snapshot de los estudiantes
let studentsSnapshot;
const getStudentsSnapshot = () => {
  return new Promise((resolve, reject) => {
    onValue(databaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        studentsSnapshot = data;
        resolve(studentsSnapshot);
      } else {
        resolve({});
      }
    }, (error) => {
      reject(error);
    });
  });
};

// Obtener referencias a los elementos del DOM
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Event listener para el botón de búsqueda
searchButton.addEventListener('click', () => {
  const searchText = searchInput.value.trim();

  if (searchText) {
    getStudentsSnapshot().then((students) => {
      const filteredStudents = filterStudentsByPlaca(students, searchText);
      renderStudents(filteredStudents);
    }).catch((error) => {
      console.error('Error al obtener estudiantes: ', error);
    });
  } else {
    renderStudents({}); // Renderiza una tabla vacía
  }
});

// Event listener para los botones de editar y eliminar
document.querySelector('tbody').addEventListener('click', (e) => {
  if (e.target.classList.contains('is-warning')) {
    const key = e.target.dataset.key;
    handleEditStudent(key);
  } else if (e.target.classList.contains('is-danger')) {
    const key = e.target.dataset.key;
    handleDeleteStudent(key);
  }
});


// Esperar a que se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', handleFormSubmit);
});
      
