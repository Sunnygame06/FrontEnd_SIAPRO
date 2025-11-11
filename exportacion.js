document.addEventListener("DOMContentLoaded", () => {
  const btnExportarPDF = document.getElementById("btnExportarPDF");

  btnExportarPDF.addEventListener("click", async () => {
    const solicitante = document.getElementById("solicitanteSelect").value;
    const insumo = document.getElementById("inventarioSelect").value;

    if (!solicitante || !insumo) {
      alert("Por favor, selecciona un solicitante y un insumo antes de exportar.");
      return;
    }

    // Insertar valores seleccionados
    document.getElementById("pdfSolicitante").textContent = solicitante;
    document.getElementById("pdfInsumo").textContent = insumo;
    document.getElementById("fechaPDF").textContent = new Date().toLocaleDateString("es-ES");

    // Mostrar temporalmente el contenedor para capturarlo
    const elemento = document.getElementById("formularioExportacion");
    elemento.style.display = "block";

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("SolicitudTintas.pdf");

    // Ocultar nuevamente
    elemento.style.display = "none";
  });
});