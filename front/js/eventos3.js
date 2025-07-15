// ==========================
// 🔹 1. Constantes y Variables Globales
// ==========================
const API_URL = "http://localhost:3000/marcas"; // URL del backend API
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const inputID = document.getElementById("brandID"); // Input para ID
const inputBrand = document.getElementById("brandName");
const selectPais = document.getElementById("pais");
let selectedBrandId = null; // Variable para almacenar el ID de la marca seleccionada

// ==========================
// 🔹 2. Funciones Principales
// ==========================

// 👉 Obtener el próximo ID disponible
async function getNextBrandID() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("No se pudieron obtener las marcas.");

    const brands = await response.json();
    inputID.value = brands.length === 0 ? "1" : Math.max(...brands.map(p => p.ID_Marca)) + 1;
  } catch (error) {
    console.error("Error al obtener el próximo ID:", error);
    inputID.value = "Error";
  }
}
// 👉 Guardar o actualizar una marca
async function storeBrand() {
  const brandName = inputBrand.value.trim();
  const countryID = parseInt(selectPais.value);

  if (!brandName || !countryID) {
    Swal.fire({
      icon: "warning",
      title: "Campos obligatorios",
      text: "El nombre de la marca y el país son requeridos."
    });
    return;
  }

  try {
    const bodyData = { nombre: brandName, fk_pais: countryID };
    const requestMethod = selectedBrandId ? "PUT" : "POST";
    const url = selectedBrandId ? `${API_URL}/${selectedBrandId}` : API_URL;

    const response = await fetch(url, {
      method: requestMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) throw new Error(await response.text());

    Swal.fire({
      icon: "success",
      title: selectedBrandId ? "Marca actualizada" : "Marca agregada",
      text: selectedBrandId ? "La marca se actualizó correctamente." : "La marca fue guardada correctamente."
    });
    cancelEdit();
    allBrands();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error al guardar",
      text: error.message
    });
  }
}

// 👉 Obtener todas las marcas
async function allBrands() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("No se pudieron cargar las marcas.");

    const brands = await response.json();
    const tableBody = document.querySelector("#table-usuarios tbody");
    tableBody.innerHTML = "";

    brands.forEach(marca => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${marca.ID_Marca}</td>
        <td>${marca.Nombre}</td>
        <td>${marca.Pais}</td>
        <td>
          <button class="btn-edit" onclick="editBrand(${marca.ID_Marca}, '${marca.Nombre}', '${marca.Pais}')" title="Editar Marca">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="btn-delete" onclick="destroyBrand(${marca.ID_Marca})" title="Eliminar Marca">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tableBody.appendChild(row);
    });

    getNextBrandID();
  } catch (error) {
    console.error("Error:", error);
  }
}

// 👉 Editar marca
function editBrand(id, nombre, pais) {
  inputID.value = id;
  inputBrand.value = nombre;
  selectedBrandId = id;

  btnGuardar.textContent = "Actualizar Marca";
  btnCancelar.style.display = "inline-block";
}

// 👉 Cancelar edición
function cancelEdit() {
  inputID.value = "";
  inputBrand.value = "";
  selectPais.value = "";
  selectedBrandId = null;

  btnGuardar.textContent = "Guardar Marca";
  btnCancelar.style.display = "none";
  getNextBrandID();
}

// 👉 Eliminar una marca
async function destroyBrand(id) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará la marca de forma permanente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("No se pudo eliminar la marca.");

    Swal.fire({
      icon: "success",
      title: "Eliminada",
      text: "Marca eliminada correctamente."
    });
    allBrands();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });
  }
}

// 👉 Buscar una marca específica
async function showBrand() {
  const brandId = document.getElementById("input-busqueda").value.trim();

  if (!brandId) {
    Swal.fire({
      icon: "warning",
      title: "Falta ID",
      text: "Por favor, ingresa un ID."
    });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${brandId}`);

    if (!response.ok) {
      if (response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "No encontrada",
          text: "La marca buscada no existe."
        });
        return;
      } else {
        throw new Error(await response.text());
      }
    }

    const brand = await response.json();
    const tableBody = document.querySelector("#table-usuarios tbody");
    tableBody.innerHTML = "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${brand.ID_Marca}</td>
      <td>${brand.Nombre}</td>
      <td>${brand.Pais}</td>
      <td>
        <button class="btn-edit" onclick="editBrand(${brand.ID_Marca}, '${brand.Nombre}', '${brand.Pais}')" title="Editar Marca">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn-delete" onclick="destroyBrand(${brand.ID_Marca})" title="Eliminar Marca">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al buscar la marca: " + error.message
    });
  }
  document.getElementById("input-busqueda").value = "";
}

// ==========================
// 🔹 3. Carga de Datos Inicial
// ==========================

// 👉 Cargar países dinámicamente
function cargarPaises() {
  fetch("http://localhost:3000/paises")
    .then(response => response.json())
    .then(data => {
      const paisSelect = document.getElementById("pais");
      paisSelect.innerHTML = '<option value="">Seleccione una opción</option>';

      data.forEach(pais => {
        const option = document.createElement("option");
        option.value = pais.ID_Pais;
        option.textContent = pais.Nombre;
        paisSelect.appendChild(option);
      });
    })
    .catch(error => console.error("Error al cargar los países:", error));
}

// ==========================
// 🔹 4. Eventos del DOM
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  if (btnGuardar) btnGuardar.addEventListener("click", (e) => { e.preventDefault(); storeBrand(); });
  if (btnCancelar) btnCancelar.addEventListener("click", (e) => { e.preventDefault(); cancelEdit(); btnCancelar.style.display = "none"; });
  if (document.getElementById("btn-mostrarElemento")) document.getElementById("btn-mostrarElemento").addEventListener("click", (e) => { e.preventDefault(); allBrands(); });
  if (document.getElementById("buscarElemento")) document.getElementById("buscarElemento").addEventListener("click", (e) => { e.preventDefault(); showBrand(); });

  btnCancelar.style.display = "none";
  allBrands();
  cargarPaises();
});
