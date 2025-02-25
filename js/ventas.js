import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const salesTableBody = document.getElementById("salesTableBody");
  const cardContainer = document.getElementById("responsiveCardContainer");
  const searchInput = document.getElementById("searchInput");
  const totalSalesElement = document.getElementById("totalSales");

  // **Indicadores Claves**
  const ventasHoyElement = document.getElementById("ventasHoy");
  const ventasSemanaElement = document.getElementById("ventasSemana");
  const totalRecaudadoHoyElement = document.getElementById("totalRecaudadoHoy");

  let sales = [];

  // 🔹 Obtener ventas desde Firestore
  const fetchSales = async () => {
    const salesCollection = collection(db, "sales");
    const salesSnapshot = await getDocs(salesCollection);
    sales = salesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  // 🔹 Calcular indicadores de ventas (Día, Semana, Total Recaudado)
  const calculateSalesMetrics = async () => {
    await fetchSales();

    const today = new Date().toISOString().split("T")[0]; // Fecha actual (YYYY-MM-DD)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekDate = lastWeek.toISOString().split("T")[0];

    let ventasHoy = 0;
    let ventasSemana = 0;
    let totalRecaudadoHoy = 0;

    sales.forEach(sale => {
      if (sale.saleDate === today) {
        ventasHoy++;
        totalRecaudadoHoy += sale.total;
      }

      if (sale.saleDate >= lastWeekDate) {
        ventasSemana++;
      }
    });

    ventasHoyElement.textContent = ventasHoy;
    ventasSemanaElement.textContent = ventasSemana;
    totalRecaudadoHoyElement.textContent = `$${totalRecaudadoHoy.toLocaleString("es-AR")}`;
  };

  // 🔹 Renderizar ventas en tabla y tarjetas
  const renderSales = (filter = "") => {
    const isMobile = window.innerWidth <= 768;
    salesTableBody.innerHTML = "";
    cardContainer.innerHTML = "";

    const filteredSales = sales.filter((sale) =>
      sale.clientName.toLowerCase().includes(filter.toLowerCase())
    );

    filteredSales.forEach((sale) => {
      const productsList = sale.products.map(
        (p) => `${p.quantity} x ${p.product} ($${p.price.toLocaleString("es-AR")})`
      ).join(", ");
      const totalPrice = sale.products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

      if (isMobile) {
        const card = document.createElement("div");
        card.className = "responsive-card";
        card.innerHTML = `
          <div><strong>Fecha:</strong> ${sale.saleDate}</div>
          <div><strong>Cliente:</strong> ${sale.clientName}</div>
          <div><strong>Productos:</strong> ${productsList}</div>
          <div><strong>Total:</strong> $${totalPrice.toLocaleString("es-AR")}</div>
          <div class="action-buttons">
            <button class="pdf-sale" data-id="${sale.id}">📄 Guia</button>
            <button class="invoice-sale" data-id="${sale.id}">🧾 Factura</button>
            <button class="delete-sale" data-id="${sale.id}">❌</button>
          </div>
        `;
        cardContainer.appendChild(card);
      } else {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${sale.saleDate}</td>
          <td>${sale.clientName}</td>
          <td>${productsList}</td>
          <td>$${totalPrice.toLocaleString("es-AR")}</td>
          <td>
            <button class="pdf-sale" data-id="${sale.id}">📄 Guia</button>
            <button class="invoice-sale" data-id="${sale.id}">🧾 Factura</button>
            <button class="delete-sale" data-id="${sale.id}">❌</button>
          </td>
        `;
        salesTableBody.appendChild(row);
      }
    });

    totalSalesElement.textContent = filteredSales.length;
  };

  // 🔹 Delegar eventos para botones "Ficha" y "Eliminar"
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("pdf-sale")) {
      const saleId = e.target.getAttribute("data-id");
      const saleData = sales.find((sale) => sale.id === saleId);
      if (saleData) {
        generatePDF(saleData);
      }
    }

    if (e.target.classList.contains("delete-sale")) {
      const saleId = e.target.getAttribute("data-id");
      if (saleId && confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
        await deleteSale(saleId);
      }
    }

    if (e.target.classList.contains("invoice-sale")) {
      const saleId = e.target.getAttribute("data-id");
      const saleData = sales.find((sale) => sale.id === saleId);
      if (saleData) {
        generateInvoicePDF(saleData);
      }
    }
  });

  // 🔹 Generar el PDF
  const generatePDF = (sale) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("GUÍA DE DESPACHO", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("REMINE BEBIDAS", 10, 30);
    doc.text("Fecha:", 160, 30);
    doc.text(sale.saleDate, 180, 30);

    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", 10, 40);
    doc.setFont("helvetica", "normal");
    doc.text(sale.clientName || "N/A", 40, 40);

    doc.line(10, 45, 200, 45);

    let yPosition = 55;
    const colX = [10, 50, 120, 170];
    const tableWidth = 190;

    doc.setFont("helvetica", "bold");
    doc.text("CANT.", colX[0] + 2, yPosition + 5);
    doc.text("PRODUCTO", colX[1] + 5, yPosition + 5);
    doc.text("PRECIO", colX[2] + 5, yPosition + 5);
    doc.rect(10, yPosition, tableWidth, 10);

    yPosition += 10;
    let total = 0;

    sale.products.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${item.quantity}`, colX[0] + 5, yPosition + 5);
      doc.text(item.product, colX[1] + 5, yPosition + 5);
      doc.text(`$${(item.price * item.quantity).toLocaleString("es-AR")}`, colX[2] + 5, yPosition + 5);
      doc.rect(10, yPosition, tableWidth, 10);
      total += item.price * item.quantity;
      yPosition += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", colX[2] - 20, yPosition + 5);
    doc.text(`$${total.toLocaleString("es-AR")}`, colX[2] + 5, yPosition + 5);
    doc.rect(10, yPosition, tableWidth, 10);

    window.open(doc.output("bloburl"), "_blank");
  };

  const generateInvoicePDF = (sale) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Formatear fecha
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-AR");
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FACTURA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Distribuidora Remine Bebidas", 10, 30);
    doc.text("Fecha:", 160, 30);
    doc.text(sale.saleDate, 180, 30);

    doc.setFont("helvetica", "bold");
    doc.text("Señor(es):", 10, 40);
    doc.setFont("helvetica", "normal");
    doc.text(sale.clientName || "N/A", 40, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Domicilio:", 10, 50);
    doc.setFont("helvetica", "normal");
    doc.text("Dirección del Cliente", 40, 50);

    doc.setFont("helvetica", "bold");
    doc.text("Condición IVA:", 10, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Consumidor Final", 50, 60);

    doc.line(10, 65, 200, 65);

    let yPosition = 75;
    const colX = [10, 30, 70, 120, 160];
    const tableWidth = 190;

    doc.setFont("helvetica", "bold");
    doc.text("CANT.", colX[0] + 2, yPosition + 5);
    doc.text("COD. ART", colX[1] + 5, yPosition + 5);
    doc.text("DESCRIPCIÓN", colX[2] + 5, yPosition + 5);
    doc.text("PRECIO", colX[3] + 5, yPosition + 5);
    doc.text("TOTAL", colX[4] + 5, yPosition + 5);
    doc.rect(10, yPosition, tableWidth, 10);

    yPosition += 10;
    let total = 0;

    sale.products.forEach((item, index) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${item.quantity}`, colX[0] + 5, yPosition + 5);
      doc.text(`000${index + 1}`, colX[1] + 5, yPosition + 5);
      doc.text(item.product, colX[2] + 5, yPosition + 5);
      doc.text(`$${item.price.toLocaleString("es-AR")}`, colX[3] + 5, yPosition + 5);
      doc.text(`$${(item.price * item.quantity).toLocaleString("es-AR")}`, colX[4] + 5, yPosition + 5);
      doc.rect(10, yPosition, tableWidth, 10);
      total += item.price * item.quantity;
      yPosition += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", colX[3] - 10, yPosition + 5);
    doc.text(`$${total.toLocaleString("es-AR")}`, colX[4] + 5, yPosition + 5);
    doc.rect(10, yPosition, tableWidth, 10);

    yPosition += 15;
    doc.setFont("helvetica", "normal");
    doc.text("Seguinos en Instagram y Facebook como: Distribuidora Remine Bebidas", 10, yPosition);
    doc.text("Atendemos llamadas y WhatsApp", 10, yPosition + 10);
    doc.text("Sucursales: Padua, Matera, Merlo Norte", 10, yPosition + 20);
    doc.text("Teléfono: 11-2837-0473 / 11-7005-2159", 10, yPosition + 30);

    doc.line(10, yPosition + 35, 200, yPosition + 35);

    doc.setFont("helvetica", "italic");
    doc.text("Señor cliente: controle su vuelto y mercadería.", 10, yPosition + 45);
    doc.text("Una vez entregados, no se aceptan reclamos.", 10, yPosition + 55);

    window.open(doc.output("bloburl"), "_blank");
};

  // 🔹 Eliminar venta de Firestore
  const deleteSale = async (id) => {
    try {
      await deleteDoc(doc(db, "sales", id));
      sales = sales.filter((sale) => sale.id !== id);
      renderSales();
      alert("Venta eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
      alert("Hubo un problema al eliminar la venta.");
    }
  };

  searchInput.addEventListener("input", (e) => {
    renderSales(e.target.value);
  });

  await fetchSales();
  await calculateSalesMetrics();
  renderSales();
});