// Datos en memoria
let clientes = [];
let paquetes = [];
let reservas = [];

// Función para registrar cliente
function registrarCliente() {
  const nombre = document.getElementById("nombreCliente").value.trim();
  const email = document.getElementById("emailCliente").value.trim();

  if (!nombre || !email) {
    alert("Por favor completa todos los campos.");
    return;
  }

  clientes.push({ nombre, email, cancelaciones: 0, riesgoso: false });
  document.getElementById("nombreCliente").value = "";
  document.getElementById("emailCliente").value = "";
  actualizarListaClientes();
  actualizarSelectClientes();
}

// Función para mostrar clientes
function actualizarListaClientes() {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";
  clientes.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${c.nombre} (${c.email}) ${c.riesgoso ? "⚠️ Riesgoso" : ""}`;
    lista.appendChild(li);
  });
}

function actualizarSelectClientes() {
  const select = document.getElementById("selectCliente");
  select.innerHTML = '<option value="">Selecciona Cliente</option>';
  clientes.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = c.nombre;
    select.appendChild(option);
  });
}

// Función para registrar paquete
function registrarPaquete() {
  const destino = document.getElementById("destinoPaquete").value.trim();
  const fecha = document.getElementById("fechaPaquete").value;
  const precio = parseFloat(document.getElementById("precioPaquete").value);
  const cupos = parseInt(document.getElementById("cupoPaquete").value);

  if (!destino || !fecha || isNaN(precio) || isNaN(cupos)) {
    alert("Por favor completa todos los campos.");
    return;
  }

  paquetes.push({ destino, fecha, precio, cupos, ocupados: 0 });
  document.getElementById("destinoPaquete").value = "";
  document.getElementById("fechaPaquete").value = "";
  document.getElementById("precioPaquete").value = "";
  document.getElementById("cupoPaquete").value = "";
  actualizarListaPaquetes();
  actualizarSelectPaquetes();
}

// Función para mostrar paquetes
function actualizarListaPaquetes() {
  const lista = document.getElementById("listaPaquetes");
  lista.innerHTML = "";
  paquetes.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${p.destino} - ${p.fecha} | $${p.precio.toFixed(2)} | Cupos: ${p.ocupados}/${p.cupos}`;
    lista.appendChild(li);
  });
}

function actualizarSelectPaquetes() {
  const select = document.getElementById("selectPaquete");
  select.innerHTML = '<option value="">Selecciona Paquete</option>';
  paquetes.forEach((p, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${p.destino} (${p.fecha})`;
    select.appendChild(option);
  });
}

// Función para reservar
function reservar() {
  const clienteIndex = document.getElementById("selectCliente").value;
  const paqueteIndex = document.getElementById("selectPaquete").value;
  const seguroExtra = document.getElementById("seguroExtra").checked;

  if (clienteIndex === "" || paqueteIndex === "") {
    alert("Selecciona cliente y paquete.");
    return;
  }

  const cliente = clientes[clienteIndex];
  const paquete = paquetes[paqueteIndex];

  if (paquete.ocupados >= paquete.cupos) {
    alert("No hay cupos disponibles.");
    return;
  }

  // Aumenta precio si está al 80% de ocupación
  if ((paquete.ocupados / paquete.cupos) >= 0.8) {
    paquete.precio *= 1.10;
    alert("Precio aumentado en 10% por alta demanda.");
  }

  const pagoInicial = cliente.riesgoso ? paquete.precio : paquete.precio * 0.5;
  reservas.push({
    cliente: cliente.nombre,
    paquete: paquete.destino,
    fecha: paquete.fecha,
    pagado: pagoInicial,
    restante: cliente.riesgoso ? 0 : paquete.precio * 0.5,
    seguro: seguroExtra
  });

  paquete.ocupados++;
  actualizarListaPaquetes();
  actualizarListaReservas();
}

function actualizarListaReservas() {
  const lista = document.getElementById("listaReservas");
  lista.innerHTML = "";
  reservas.forEach((r, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${r.cliente} → ${r.paquete} | Pagado: $${r.pagado.toFixed(2)} | Restante: $${r.restante.toFixed(2)} ${r.seguro ? "🛡️ Seguro" : ""}`;
    lista.appendChild(li);
  });
}

// Función para mostrar recordatorios
function mostrarRecordatorios() {
  const lista = document.getElementById("listaRecordatorios");
  lista.innerHTML = "";
  reservas.forEach(r => {
    if (r.restante > 0) {
      const li = document.createElement("li");
      li.textContent = `Recordatorio: ${r.cliente} debe pagar $${r.restante.toFixed(2)} antes del viaje.`;
      lista.appendChild(li);
    }
  });
}
