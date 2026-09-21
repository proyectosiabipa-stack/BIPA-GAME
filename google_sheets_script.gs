/**
 * =========================================================================
 * BIPA - SCRIPT PARA CONECTAR EL JUEGO CON GOOGLE SHEETS
 * =========================================================================
 * 
 * Este script recibe automáticamente los registros de los jugadores
 * desde el portal web y los guarda en las columnas de tu hoja de cálculo.
 * 
 * INSTRUCCIONES RÁPIDAS:
 * 1. En tu Google Sheet, ve a: Extensiones > Apps Script.
 * 2. Borra todo el código que aparezca y pega este código completo.
 * 3. Haz clic en "Guardar" (icono de disquete).
 * 4. Haz clic en "Implementar" (botón azul arriba a la derecha) > "Nueva implementación".
 * 5. En tipo de implementación, elige "Aplicación web".
 * 6. Configura:
 *    - Descripción: BIPA Webhook
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario (Anyone)  <--- ¡MUY IMPORTANTE!
 * 7. Haz clic en "Implementar" y copia la URL de la aplicación web que te entrega.
 * 8. Pega esa URL en el archivo index.html en la variable GOOGLE_SHEETS_SCRIPT_URL.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Encabezados requeridos (se crean automáticamente si la hoja está vacía)
    var headers = [
      "Fecha y Hora",
      "Código Ticket",
      "Nombre Completo",
      "Teléfono",
      "Correo Electrónico",
      "Estado",
      "Protección de Datos Aceptada",
      "Resultado Juego"
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e4d2b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    // Formatear fecha y hora local
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT-4", "yyyy-MM-dd HH:mm:ss");

    var newRow = [
      timestamp,
      data.ticketCode || "N/A",
      data.nombre || "",
      data.telefono || "",
      data.email || "",
      data.estado || "",
      data.proteccionDatos || "SÍ (Aceptado)",
      data.resultado || "Participó"
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead registrado exitosamente",
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Servicio de recepción de datos BIPA activo.");
}
