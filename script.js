let clientes = [];
let paquetes = [];
let reservas = [];

const ADMIN = {
  user: "admin",
  pass: "1234"
};

let sesionActiva = false;

// LOGIN
function loginAdmin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === ADMIN.user && pass === ADMIN.pass) {
    sesionActiva = true;
    document.getElementById("estadoSesion").textContent = "Sesión iniciada";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

function logoutAdmin() {
  sesionActiva = false;
  document.getElementById("estadoSesion").textContent = "";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

// CLIENTES
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

// PAQUETES
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

// RESERVAR
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

  if ((paquete.ocupados / paquete.cupos) >= 0.8) {
    paquete.precio *= 1.10;
    alert("Precio aumentado en 10% por alta demanda.");
  }

  const pagoInicial = cliente.riesgoso ? paquete.precio : paquete.precio * 0.5;
  reservaPendiente = {
  clienteIndex,
  paqueteIndex,
  cliente,
  paquete,
  seguro: seguroExtra,
  fechaReserva: new Date()
};

// Si no es riesgoso, mostrar modal de confirmación para pagar 50%
if (!cliente.riesgoso) {
  document.getElementById("modalConfirmacion").style.display = "block";
} else {
  confirmarPagoInicial(true); // pago completo directo
}
  actualizarListaPaquetes();
  actualizarListaReservas();
}

function actualizarListaReservas() {
  const lista = document.getElementById("listaReservas");
  lista.innerHTML = "";
  reservas.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
    ${i + 1}. ${r.cliente} → ${r.paquete} | Pagado: $${r.pagado.toFixed(2)} | Restante: $${r.restante.toFixed(2)} ${r.seguro ? "🛡️ Seguro" : ""}
    ${r.restante > 0 ? `<button onclick="completarPago(${i})">Pago Completado</button>` : `<span style="color:green;font-weight:bold;">✓ Pago Completo</span>`}
    <button onclick="cancelarReserva(${i})">Cancelar Reserva</button>`;
    lista.appendChild(li);
  });
}

function mostrarRecordatorios() {
  const lista = document.getElementById("listaRecordatorios");
  lista.innerHTML = "";
  const hoy = new Date();

  reservas.forEach(r => {
    if (r.restante > 0) {
      const fechaReserva = new Date(r.fechaReserva);
      const tiempoPasado = Math.floor((hoy - fechaReserva) / (1000 * 60 * 60 * 24)); // días

      const li = document.createElement("li");
      li.textContent = `🔔 ${r.cliente} debe pagar $${r.restante.toFixed(2)}. Tiempo restante: ${7 - tiempoPasado} días`;

      if (tiempoPasado > 7) {
        li.style.color = "red";
        li.textContent += " ⚠️ PLAZO VENCIDO";
      }

      lista.appendChild(li);
    }
  });
}

let reservaPendiente = null;

function confirmarPagoInicial(pagoCompleto = false) {
  const { cliente, paquete, seguro, clienteIndex, paqueteIndex, fechaReserva } = reservaPendiente;

  const precio = paquete.precio;
  const pagado = pagoCompleto ? precio : precio * 0.5;
  const restante = pagoCompleto ? 0 : precio * 0.5;

  reservas.push({
    cliente: cliente.nombre,
    paquete: paquete.destino,
    fecha: paquete.fecha,
    pagado,
    restante,
    seguro,
    fechaReserva
  });

  paquetes[paqueteIndex].ocupados++;
  actualizarListaPaquetes();
  actualizarListaReservas();

  // Si hay pago restante, mostrar QR
  if (!pagoCompleto) {
    document.getElementById("modalQR").style.display = "block";
  }

  document.getElementById("modalConfirmacion").style.display = "none";
  reservaPendiente = null;
}

function cancelarPago() {
  document.getElementById("modalConfirmacion").style.display = "none";
  reservaPendiente = null;
}

function cerrarModalQR() {
  document.getElementById("modalQR").style.display = "none";
}

// Completa el pago restante
function completarPago(index) {
  const reserva = reservas[index];
  reserva.pagado += reserva.restante;
  reserva.restante = 0;
  alert(`Pago completado para ${reserva.cliente}`);
  actualizarListaReservas();
}

// Cancela una reserva
function cancelarReserva(index) {
  const reserva = reservas[index];
  // Reducir ocupación del paquete
  const paquete = paquetes.find(p => p.destino === reserva.paquete && p.fecha === reserva.fecha);
  if (paquete) paquete.ocupados--;
  
  // Marcar cancelación en cliente
  const cliente = clientes.find(c => c.nombre === reserva.cliente);
  if (cliente) {
    cliente.cancelaciones++;
    if (cliente.cancelaciones >= 2) cliente.riesgoso = true;
  }

  // Eliminar reserva
  reservas.splice(index, 1);
  alert(`Reserva cancelada para ${reserva.cliente}`);
  actualizarListaPaquetes();
  actualizarListaReservas();
}
