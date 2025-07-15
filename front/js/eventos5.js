// ==========================
// 🔹 1. Constantes y Variables Globales
// ==========================
const API_URL = "http://localhost:3000/provincias"; // URL del backend API

const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const inputID = document.getElementById("provinceID"); // Input para ID
const inputProvince = document.getElementById("provinceName");

let selectedProvinceId = null; // Variable para almacenar el ID de la provincia seleccionado

// ==========================
// 🔹 2. Funciones Principales
// ==========================

// 🔍 Obtener el próximo ID disponible
async function getNextProvinceID() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("No se pudieron obtener las provincias.");

    const provinces = await response.json();
    inputID.value = provinces.length === 0 ? "1" : Math.max(...provinces.map(p => p.ID_Provincia)) + 1;
  } catch (error) {
    console.error("Error al obtener el próximo ID:", error);
    inputID.value = "Error";
  }
}

// 💼 Guardar o actualizar una provincia
async function storeProvince() {
  const provinceName = inputProvince.value.trim();
  if (!provinceName) {
    return Swal.fire("Campo requerido", "El nombre de la provincia es obligatorio.", "warning");
    
  }

  try {
    const requestMethod = selectedProvinceId ? "PUT" : "POST";
    const url = selectedProvinceId ? `${API_URL}/${selectedProvinceId}` : API_URL;
    const bodyData = { ID_Province: Number(inputID.value), nombre: provinceName };

    const response = await fetch(url, {
      method: requestMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) throw new Error(await response.text());

    Swal.fire("Éxito", selectedProvinceId ? "Provincia actualizada correctamente." : "Provincia guardada correctamente.", "success");
    cancelEdit();
    allProvinces();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar la provincia: " + error.message);
  }
}

// 🌐 Obtener todos las provincias
async function allProvinces() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("No se pudieron cargar las provincias.");

    const provinces = await response.json();
    const tableBody = document.querySelector("#table-usuarios tbody");
    tableBody.innerHTML = "";

    provinces.forEach((province) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${province.ID_Provincia}</td>
        <td>${province.Nombre}</td>
        <td>
          <button class="btn-edit" onclick="editProvince(${province.ID_Provincia}, '${province.Nombre}')" title="Editar Provincia">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="btn-delete" onclick="destroyProvince(${province.ID_Provincia})" title="Eliminar Provincia">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tableBody.appendChild(row);
    });

    getNextProvinceID();
  } catch (error) {
   // console.error("Error:", error);
   // alert(error.message);
  }
}

// ✏️ Editar provincia
function editProvince(id, nombre) {
  inputID.value = id;
  inputProvince.value = nombre;
  selectedProvinceId = id;

  btnGuardar.textContent = "Actualizar Provincia";
  btnCancelar.style.display = "inline-block";
}

// ❌ Cancelar edición
function cancelEdit() {
  inputID.value = "";
  inputProvince.value = "";
  selectedProvinceId = null;

  btnGuardar.textContent = "Guardar Provincia";
  btnCancelar.style.display = "none";
  getNextProvinceID();
}

async function destroyProvince(id) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta provincia se eliminará permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#999",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("No se pudo eliminar la provincia.");

    Swal.fire("Eliminado", "Provincia eliminada correctamente.", "success");
    allProvinces();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire("Error", error.message, "error");
  }
}

// 📊 Buscar provincia por ID
async function showProvince() {
  const provinceId = document.getElementById("input-busqueda").value.trim();
  if (!provinceId) {
    return Swal.fire("Campo vacío", "Por favor, ingresa un ID.", "warning");
   
  }

  try {
    const response = await fetch(`${API_URL}/${provinceId}`);
    if (!response.ok) {
      if (response.status === 404) {
         return Swal.fire("No encontrado", "La provincia buscado no existe.", "error");
        
      } else {
        throw new Error(await response.text());
      }
    }

    const province = await response.json();
    const tableBody = document.querySelector("#table-usuarios tbody");
    tableBody.innerHTML = "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${province.ID_Provincia}</td>
      <td>${province.Nombre}</td>
      <td>
        <button class="btn-edit" onclick="editProvince(${province.ID_Province}, '${province.Nombre}')" title="Editar provincia">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn-delete" onclick="destroyProvince(${province.ID_Province})" title="Eliminar province">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  } catch (error) {
    console.error("Error:", error);
    alert("Error al buscar la provincia: " + error.message);
  }
  document.getElementById("input-busqueda").value = "";
}

// ==========================
// 🔹 3. Eventos del DOM
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  if (btnGuardar) btnGuardar.addEventListener("click", (e) => { e.preventDefault(); storeProvince(); });
  if (btnCancelar) btnCancelar.addEventListener("click", (e) => { e.preventDefault(); cancelEdit(); });
  if (document.getElementById("btn-mostrarElemento")) document.getElementById("btn-mostrarElemento").addEventListener("click", (e) => { e.preventDefault(); allProvinces(); });
  if (document.getElementById("buscarElemento")) document.getElementById("buscarElemento").addEventListener("click", (e) => { e.preventDefault(); showProvince(); });

  btnCancelar.style.display = "none";
  allProvinces();
});
