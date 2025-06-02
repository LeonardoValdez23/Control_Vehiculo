let ipGlobal = ""; // IP pública
let grabando = false;
let grabacionFinalizada = false;
let secuencia = [];
let reproduciendo = false;
let intervalo = null;
let indiceSecuencia = 0;
let ultimaInstruccion = null;


// Diccionario para enviar clave a API
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

// Diccionario para mostrar en pantalla
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

// Obtener IP al cargar
document.addEventListener('DOMContentLoaded', function () {
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      ipGlobal = data.ip;
      console.log("IP pública detectada:", ipGlobal);
      iniciarBotones();
    })
    .catch(error => {
      console.error('Error al obtener IP:', error);
      ipGlobal = "IP_NO_DETECTADA";
      iniciarBotones();
    });
});

function iniciarBotones() {
  const buttons = document.querySelectorAll('button[data-status]');
  const ordenDisplay = document.getElementById('ordenDisplay');
  const btnGrabar = document.getElementById('iniciarGrabacion');
  const btnSecuencia = document.getElementById('comenzarSecuencia');
  const btnDetener = document.getElementById('detenerSecuencia');
  const btnDetenerGrabacion = document.getElementById('detenerGrabacion');
  const sliderVelocidad = document.getElementById("velocidad");
  const valorVelocidad = document.getElementById("valorVelocidad");
  const btnEnviarVelocidad = document.getElementById("btnEnviarVelocidad");

sliderVelocidad.addEventListener("input", () => {
  valorVelocidad.textContent = sliderVelocidad.value;
});

btnEnviarVelocidad.addEventListener("click", () => {
  const nuevaVelocidad = sliderVelocidad.value;

  const payloadVelocidad = {
    ip: ipGlobal,
    name: "Leonardo Valdez",
    status: `VELOCIDAD_${nuevaVelocidad}`
  };

  fetch('http://18.207.223.229/api/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payloadVelocidad)
  })
    .then(response => {
      if (!response.ok) throw new Error('Error en la petición');
      return response.json();
    })
    .then(data => {
      console.log('Velocidad enviada:', data);
      mostrarOrden(`Velocidad ajustada a ${nuevaVelocidad}`);

      // Reenviar la última instrucción si hay una activa
      if (ultimaInstruccion && ultimaInstruccion !== "DETENER") {
        const nombreCompleto = displayMap[ultimaInstruccion] || ultimaInstruccion;
        enviarMovimiento(ultimaInstruccion, nombreCompleto);
      }
    })
    .catch(error => {
      console.error("Error al enviar velocidad:", error);
      mostrarOrden("Error al ajustar velocidad");
    });
});


  // Evento para iniciar grabación
  btnGrabar.addEventListener('click', () => {
    grabando = true;
    grabacionFinalizada = false;
    secuencia = [];
    mostrarOrden("Grabación iniciada (máx 10 movimientos)");
  });

  // Evento para detener grabación
  btnDetenerGrabacion.addEventListener('click', () => {
    if (!grabando) {
      mostrarOrden("No hay grabación en curso");
      return;
    }

    grabando = false;
    grabacionFinalizada = true;
    mostrarOrden(`Grabación finalizada (${secuencia.length} movimientos)`);
  });

  // Evento para comenzar la secuencia
  btnSecuencia.addEventListener('click', () => {
    if (!grabacionFinalizada) {
      mostrarOrden("Se debe detener la grabación antes de comenzar una secuencia");
      return;
    }

    if (secuencia.length === 0) {
      mostrarOrden("No hay movimientos grabados");
      return;
    }

    if (reproduciendo) {
      mostrarOrden("Ya se está reproduciendo la secuencia");
      return;
    }

    reproduciendo = true;
    indiceSecuencia = 0;
    mostrarOrden("Reproduciendo secuencia...");
    reproducirSecuencia();
  });

  // Evento para detener la secuencia inmediatamente
  // Evento para detener la secuencia o borrar grabación
btnDetener.addEventListener('click', () => {
  // Si se está reproduciendo la secuencia, detenerla
  if (intervalo) clearInterval(intervalo);
  reproduciendo = false;
  indiceSecuencia = 0;

  // Si se está grabando, también borramos la secuencia
  if (grabando || secuencia.length > 0) {
    grabando = false;
    grabacionFinalizada = false;
    secuencia = [];
    document.getElementById("listaSecuencia").innerHTML = ""; // Limpiar visualización
    mostrarOrden("Grabación cancelada y secuencia borrada");
  } else {
    mostrarOrden("Secuencia interrumpida");
  }

  // Orden inmediata de detener al carrito
  enviarMovimiento("DETENER", "DETENER");
});


  // Evento para botones de movimiento
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const status = button.getAttribute('data-status');
      const clave = statusMap[status] || status;
      const nombreCompleto = displayMap[clave] || clave;

      if (grabando && secuencia.length < 10) {
        secuencia.push(clave);
        mostrarOrden(`Grabado: ${nombreCompleto} (${secuencia.length}/10)`);
        actualizarVisualizacionSecuencia(); // << AÑADIDO
        if (secuencia.length === 10) {
          grabando = false;
          grabacionFinalizada = true;
          mostrarOrden("Grabación finalizada (10 movimientos)");
        }
      } else if (!reproduciendo) {
        enviarMovimiento(clave, nombreCompleto);
      }
    });
  });

  function enviarMovimiento(clave, nombreCompleto) {
    ultimaInstruccion = clave; // Guardar siempre la última instrucción aquí
  
    const payload = {
      ip: ipGlobal,
      name: "Leonardo Valdez",
      status: clave
    };
  
    fetch('http://18.207.223.229/api/devices', {
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
        mostrarOrden(nombreCompleto);
      })
      .catch(error => {
        console.error('Error al enviar la orden:', error);
        mostrarOrden("Error al enviar orden");
      });
  }
  
  function reproducirSecuencia() {
    intervalo = setInterval(() => {
      if (indiceSecuencia >= secuencia.length || !reproduciendo) {
        clearInterval(intervalo);
  
        if (reproduciendo) {
          mostrarOrden("Secuencia finalizada. Reiniciando...");
          // Esperar 1 segundo y reiniciar la secuencia
          setTimeout(() => {
            indiceSecuencia = 0;
            reproducirSecuencia(); // Repetir
          }, 1000); // 1 segundo = 1000 ms
        } else {
          mostrarOrden("Secuencia interrumpida");
        }
  
        return;
      }

      const clave = secuencia[indiceSecuencia];
      const nombreCompleto = displayMap[clave] || clave;
      enviarMovimiento(clave, nombreCompleto);
      indiceSecuencia++;
    }, 1500); // 1.5 segundos entre movimientos
  }
  

  function mostrarOrden(orden) {
    ordenDisplay.innerHTML = `<h3 class="text-success">${orden}</h3>`;
  }
}

function actualizarVisualizacionSecuencia() {
  const lista = document.getElementById("listaSecuencia");
  lista.innerHTML = ""; // Limpiar lista anterior

  secuencia.forEach((clave, index) => {
    const nombre = displayMap[clave] || clave;
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = `${index + 1}. ${nombre}`;
    lista.appendChild(item);
  });
}


