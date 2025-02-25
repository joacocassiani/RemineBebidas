import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// 🔹 Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const salesCollection = collection(db, "sales"); // ✅ Definir la colección correctamente

// 📊 Función para obtener ventas
const fetchSalesData = async () => {
  const salesCollection = collection(db, "sales");
  const salesSnapshot = await getDocs(salesCollection);
  return salesSnapshot.docs.map(doc => doc.data());
};

// 📊 Gráfico de Ventas por Día
const renderSalesByDayChart = async () => {
  const sales = await fetchSalesData();
  const salesByDate = {};

  sales.forEach(sale => {
      if (!sale.saleDate) return; // Evita errores si no hay fecha
      let date = new Date(sale.saleDate).toLocaleDateString("es-AR"); // Formato DD/MM/YYYY
      salesByDate[date] = (salesByDate[date] || 0) + sale.total;
  });

  const labels = Object.keys(salesByDate).sort(); // Ordenar fechas
  const data = Object.values(salesByDate);

  new Chart(document.getElementById("ventasPorDiaChart"), {
      type: "line",
      data: {
          labels: labels,
          datasets: [{
              label: "Ventas Totales ($)",
              data: data,
              borderColor: "#188d4d",
              backgroundColor: "rgba(24, 141, 77, 0.2)",
              borderWidth: 2
          }]
      },
      options: {
          responsive: true,
          plugins: {
              legend: { display: true },
          }
      }
  });
};

// Llamar las funciones para generar los gráficos
renderSalesByDayChart();
renderBestSellingProductsChart();