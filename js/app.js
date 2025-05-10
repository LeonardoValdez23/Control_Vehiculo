let ipGlobal = ""; // Variable global para guardar la IP pública

// Diccionario: texto del botón => clave corta
const statusMap = {
  "ADELANTE": "ADELANTE",
  "ATRÁS": "ATRAS",
  "DETENER": "DETENER",
  "VUELTA DERECHA ADE": "V ADE DER",
  "VUELTA IZQUIERDA ADE": "V ADE IZQ",
  "VUELTA DERECHA ATR": "V ATR DER",
  "VUELTA IZQUIERDA ATR": "V ATR IZQ",
  "GIRO 90 DER": "G 90 DER",
  "GIRO 90 IZQ": "G 90 IZQ",
  "GIRO 360 DER": "G 360 DER",
  "GIRO 360 IZQ": "G 360 IZQ"
};

// Diccionario inverso: clave corta => nombre completo
const displayMap = {
  "ADELANTE": "ADELANTE",
  "ATRAS": "ATRÁS",
  "DETENER": "DETENER",
  "V ADE DER": "VUELTA ADELANTE DERECHA",
  "V ADE IZQ": "VUELTA ADELANTE IZQUIERDA",
  "V ATR DER": "VUELTA ATRÁS DERECHA",
  "V ATR IZQ": "VUELTA ATRÁS IZQUIERDA",
  "G 90 DER": "GIRO 90 DERECHA",
  "G 90 IZQ": "GIRO 90 IZQUIERDA",
  "G 360 DER": "GIRO 360 DERECHA",
  "G 360 IZQ": "GIRO 360 IZQUIERDA"
};

// Obtener la IP pública al cargar la aplicación
document.addEventListener('DOMContentLoaded', function () {
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      ipGlobal = data.ip;
      console.log("IP pública detectada:", ipGlobal);
      iniciarBotones(); // Inicia lógica después de tener IP
    })
    .catch(error => {
      console.error('Error al obtener IP:', error);
      ipGlobal = "IP_NO_DETECTADA";
      iniciarBotones(); // Continuar aunque falle
    });
});

function iniciarBotones() {
  const buttons = document.querySelectorAll('button[data-status]');
  const ordenDisplay = document.getElementById('ordenDisplay');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const status = button.getAttribute('data-status'); // Ej. GIRO 90 DER
      const clave = statusMap[status] || status;          // Ej. G 90 DER
      const nombreCompleto = displayMap[clave] || clave;  // Ej. GIRO 90 DERECHA

      const payload = {
        ip: ipGlobal,
        name: "Leonardo Valdez",
        status: clave // Aquí solo se envía la CLAVE
      };

      fetch('http://44.210.90.180/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          if (!response.ok) throw new Error('Error en la petición');
          return response.json();
        })
        .then(data => {
          console.log('Respuesta de la API:', data);
          mostrarOrden(nombreCompleto); // Mostrar nombre completo
        })
        .catch(error => {
          console.error('Error al enviar la orden:', error);
          mostrarOrden("Error al enviar orden");
        });
    });
  });

  function mostrarOrden(orden) {
    ordenDisplay.innerHTML = `<h3 class="text-success">${orden}</h3>`;
  }
}
