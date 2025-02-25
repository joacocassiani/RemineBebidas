import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcguTxIJqCgQ3qT-ap6HiTnRZhI7AcaQI",
  authDomain: "reminebebidas.firebaseapp.com",
  projectId: "reminebebidas",
  storageBucket: "reminebebidas.firebasestorage.app",
  messagingSenderId: "996821910868",
  appId: "1:996821910868:web:75a07b4b71e55255e174c1",
  measurementId: "G-4S1QQPS1QW"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const newSaleForm = document.getElementById("newSaleForm");
  const productsContainer = document.getElementById("productsContainer");
  const addProductButton = document.getElementById("addProductButton");

    // Obtener el input de fecha
  const saleDateInput = document.getElementById("saleDate");

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  
  // Asignar la fecha de hoy al input
  saleDateInput.value = today;

  const productsList = [
    "Coca Cola 500ml x6",
    "Fanta 500ml x6",
    "Sprite 500ml x6",
    "Pepsi 500ml x6",
    "Agua Mineral 1.5L",
    "Jugo Baggio 1L",
    "Cerveza Quilmes 1L",
    "Energizante Speed 250ml",
  ];

  // Agregar un nuevo producto dinámicamente
  addProductButton.addEventListener("click", () => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product-entry");
    productDiv.innerHTML = `
      <select class="product-name" required>
        <option value="" disabled selected>Selecciona un producto</option>
        ${productsList.map((product) => `<option value="${product}">${product}</option>`).join("")}
      </select>
      <div class="product-details">
        <input type="number" class="product-quantity" placeholder="Cantidad" min="1" required />
        <input type="number" class="product-price" placeholder="Precio Unitario" step="0.01" required />
      </div>
      <button type="button" class="remove-product">❌</button>
    `;
    productsContainer.appendChild(productDiv);

    // Agregar funcionalidad para eliminar productos
    productDiv.querySelector(".remove-product").addEventListener("click", () => {
      productDiv.remove();
    });
  });

  // Guardar la venta en Firestore
  newSaleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const clientName = document.getElementById("clientName").value;
    const productElements = document.querySelectorAll(".product-entry");

    let total = 0;
    const products = [];

    productElements.forEach((productDiv) => {
      const productName = productDiv.querySelector(".product-name").value;
      const quantity = parseInt(productDiv.querySelector(".product-quantity").value, 10);
      const price = parseFloat(productDiv.querySelector(".product-price").value);

      const productTotal = quantity * price;
      total += productTotal;

      products.push({
        product: productName,
        quantity: quantity,
        price: price
      });
    });

    if (products.length === 0) {
      alert("Debe agregar al menos un producto.");
      return;
    }

    const saleDateInput = document.getElementById("saleDate").value;

    // Si el usuario no seleccionó una fecha, usamos la fecha de hoy
    const saleDate = saleDateInput ? saleDateInput : new Date().toISOString().split("T")[0];

    const newSale = {
      clientName,
      products, // Ahora es un array de productos
      total,
      date: saleDate, // Guardar la fecha de la venta
    };

    try {
      await addDoc(collection(db, "sales"), newSale);
      alert("Venta registrada exitosamente");
      window.location.href = "../html/ventas.html";
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      alert("Ocurrió un error al registrar la venta. Por favor, inténtalo nuevamente.");
    }
  });

  // Deshabilitar el scroll en los campos de número
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener('wheel', (e) => e.preventDefault());
  });
});