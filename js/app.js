let ipGlobal = ""; // Variable global para guardar la IP pública

// Diccionario: texto del botón => clave corta
const statusMap = {
  "ADELANTE": "ADELANTE",
  "ATRÁS": "ATRAS",
  "DETENER": "DETENER",
  "VUELTA DERECHA ADE": "V_ADE_DER",
  "VUELTA IZQUIERDA ADE": "V_ADE_IZQ",
  "VUELTA DERECHA ATR": "V_ATR_DER",
  "VUELTA IZQUIERDA ATR": "V_ATR_IZQ",
  "GIRO 90 DER": "G_90_DER",
  "GIRO 90 IZQ": "G_90_IZQ",
  "GIRO 360 DER": "G_360_DER",
  "GIRO 360 IZQ": "G_360_IZQ"
};

// Diccionario inverso: clave corta => nombre completo
const displayMap = {
  "ADELANTE": "ADELANTE",
  "ATRAS": "ATRÁS",
  "DETENER": "DETENER",
  "V_ADE_DER": "VUELTA ADELANTE DERECHA",
  "V_ADE_IZQ": "VUELTA ADELANTE IZQUIERDA",
  "V_ATR_DER": "VUELTA ATRÁS DERECHA",
  "V_ATR_IZQ": "VUELTA ATRÁS IZQUIERDA",
  "G_90_DER": "GIRO 90 DERECHA",
  "G_90_IZQ": "GIRO 90 IZQUIERDA",
  "G_360_DER": "GIRO 360 DERECHA",
  "G_360_IZQ": "GIRO 360 IZQUIERDA"
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

      fetch('http://54.158.65.190/api/devices', {
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
