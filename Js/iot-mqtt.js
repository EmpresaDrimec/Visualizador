var clientId = "ws" + Math.random();
// Create a client instance
var client = new Paho.MQTT.Client("192.168.0.3", 9001, clientId);

var lastUpdateTime = {
  temp: null,
  hum: null,
  fire: null,
  vol: null,
  lat: null,
  lon: null
};

// Variable para el contenedor seleccionado
var currentContainer = "contenedor1";

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess: onConnect});

// called when the client connects
function onConnect() {
  console.log("Conectado MQTT-WebSocket");
  subscribeToContainer(currentContainer);
}

// Función para suscribirse a un contenedor específico y cambiar el estilo del botón seleccionado
function subscribeToContainer(container) {
  client.unsubscribe(currentContainer);  // Desuscribirse del contenedor anterior
  currentContainer = container;
  client.subscribe(container, { qos: 0 });
  console.log("Suscrito a " + container);

  // Actualizar los botones para que el seleccionado tenga un color diferente
  document.querySelectorAll(".container-btn").forEach(button => {
    button.classList.remove("selected");
  });
  document.getElementById(container + "-btn").classList.add("selected");
}

// Función para agregar un nuevo contenedor (aquí podrías implementar lógica adicional)
function addContainer() {
  var newContainerNumber = parseInt(currentContainer.replace("contenedor", "")) + 1;
  var newContainer = "contenedor" + newContainerNumber;
  subscribeToContainer(newContainer);

  // Crear un nuevo botón para el nuevo contenedor
  const containerButton = document.createElement("button");
  containerButton.id = newContainer + "-btn";
  containerButton.classList.add("container-btn");
  containerButton.innerText = "Contenedor " + newContainerNumber;
  containerButton.onclick = function () {
    subscribeToContainer(newContainer);
  };
  document.getElementById("container-buttons").appendChild(containerButton);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  var reading;
  try {
    reading = JSON.parse(message.payloadString);
  } catch (error) {
    console.error("Error parsing message:", error);
    return;
  }

  document.getElementById('temp-value').innerText = reading.temp + ' °C';
  document.getElementById('hum-value').innerText = reading.hum + ' %';
  document.getElementById('fire-value').innerText = reading.fire ? 'Fuego detectado' : 'Sin fuego';
  document.getElementById('vol-value').innerText = reading.vol + ' %';
  document.getElementById('lat-value').innerText = reading.lat;
  document.getElementById('lon-value').innerText = reading.lon;

  var now = new Date().toLocaleTimeString();
  lastUpdateTime.temp = now;
  lastUpdateTime.hum = now;
  lastUpdateTime.fire = now;
  lastUpdateTime.vol = now;
  lastUpdateTime.lat = now;
  lastUpdateTime.lon = now;

  document.getElementById('temp-update').innerText = "Última actualización: " + lastUpdateTime.temp;
  document.getElementById('hum-update').innerText = "Última actualización: " + lastUpdateTime.hum;
  document.getElementById('fire-update').innerText = "Última actualización: " + lastUpdateTime.fire;
  document.getElementById('vol-update').innerText = "Última actualización: " + lastUpdateTime.vol;
  document.getElementById('lat-update').innerText = "Última actualización: " + lastUpdateTime.lat;
  document.getElementById('lon-update').innerText = "Última actualización: " + lastUpdateTime.lon;

  // Aplicar colores dinámicos
  var humColor = getHumidityColor(reading.hum);
  document.getElementById('hum-card').style.backgroundColor = humColor;

  var volColor = getVolumeColor(reading.vol);
  document.getElementById('vol-card').style.backgroundColor = volColor;
}

// Función para determinar el color en función de la humedad
function getHumidityColor(hum) {
  if (hum < 40) return "#ADD8E6"; // Azul claro
  if (hum >= 40 && hum <= 70) return "#6495ED"; // Azul intermedio
  return "#00008B"; // Azul oscuro
}

// Función para determinar el color en función del volumen
function getVolumeColor(vol) {
  return vol < 85 ? "#87CEFA" : "#FF6347"; // Celeste claro o Rojo
}
