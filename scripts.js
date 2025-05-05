// Función para navegar a una sección específica
function navigateToSection(sectionId) {
  const contents = document.querySelectorAll('.content');
  contents.forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Funciones globales
function showRegisterForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (username && password) {
    const existingUser = localStorage.getItem(username);
    if (existingUser) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre de usuario ya existe',
        text: 'Elige otro nombre de usuario.'
      });
      return;
    }

    const user = { username, password };
    localStorage.setItem(username, JSON.stringify(user));

    Swal.fire({
      icon: 'success',
      title: '¡Registro exitoso!',
      text: 'Ahora puedes iniciar sesión.'
    }).then(() => {
      showLoginForm();
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Por favor, completa todos los campos.'
    });
  }
}

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (username && password) {
    const user = JSON.parse(localStorage.getItem(username));
    if (user && user.password === password) {
      sessionStorage.setItem('currentUser', username);
      Swal.fire({
        icon: 'success',
        title: 'Inicio de sesión exitoso',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = 'index.html';
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Usuario o contraseña incorrectos',
        text: 'Inténtalo de nuevo.'
      });
    }
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Por favor, completa todos los campos.'
    });
  }
}

function logout() {
  Swal.fire({
    title: '¿Deseas cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.removeItem('currentUser');
      location.href = './login.html';
    }
  });
}

function addDeviceCard(name, isOn) {
  const container = document.getElementById('dispositivos');
  const addCard = container.querySelector('.card:last-child');

  const newCard = document.createElement('div');
  newCard.className = 'card';
  newCard.dataset.name = name;

  newCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <p><strong>${name}</strong> - ${isOn ? 'Encendido' : 'Apagada'}</p>
      <button class="delete-btn" style="background-color: #f32121; color: white;">✖</button>
    </div>
    <button class="button toggle-btn">${isOn ? 'Apagar' : 'Encender'}</button>
  `;

  container.insertBefore(newCard, addCard);

  newCard.querySelector('.toggle-btn').addEventListener('click', toggleDevice);
  newCard.querySelector('.delete-btn').addEventListener('click', () => {
    Swal.fire({
      title: '¿Eliminar este dispositivo?',
      text: `Se eliminará "${name}" permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        deleteDevice(name);
        newCard.remove();
        Swal.fire('Eliminado', 'El dispositivo ha sido eliminado.', 'success');
      }
    });
  });
}

function toggleDevice() {
  const card = this.closest('.card');
  const p = card.querySelector('p');
  const name = card.dataset.name;

  const estadoActual = p.innerText.includes('Encendido') ? 'Encendido' : 'Apagada';
  const nuevoEstado = estadoActual === 'Encendido' ? 'Apagada' : 'Encendido';
  const nuevoTextoBoton = this.innerText === 'Apagar' ? 'Encender' : 'Apagar';

  p.innerHTML = p.innerHTML.replace(estadoActual, nuevoEstado);
  this.innerText = nuevoTextoBoton;

  const devices = JSON.parse(localStorage.getItem('devices')) || {};
  if (devices[name] !== undefined) {
    devices[name] = nuevoEstado === 'Encendido';
    localStorage.setItem('devices', JSON.stringify(devices));
  }
}

function storeDevice(name, isOn) {
  const devices = JSON.parse(localStorage.getItem('devices')) || {};
  devices[name] = isOn;
  localStorage.setItem('devices', JSON.stringify(devices));
}

function deleteDevice(name) {
  const devices = JSON.parse(localStorage.getItem('devices')) || {};
  delete devices[name];
  localStorage.setItem('devices', JSON.stringify(devices));
}

function loadStoredDevices() {
  const devices = JSON.parse(localStorage.getItem('devices')) || {};
  Object.keys(devices).forEach(name => {
    addDeviceCard(name, devices[name]);
  });
}

// Hacer funciones accesibles globalmente
window.login = login;
window.register = register;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.logout = logout;

// Inicialización DOM
document.addEventListener('DOMContentLoaded', () => {
  // Ícono de ayuda
  const icon = document.querySelector(".floating-icon");
  if (icon) icon.setAttribute("title", "Ayuda");

  // Mostrar formulario de login por defecto
  if (document.getElementById('loginForm')) showLoginForm();

  // Mostrar dashboard por defecto
  if (document.getElementById('dashboard')) {
    document.getElementById('dashboard').style.display = 'block';
  }

  // Usuario en sesión
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser && window.location.pathname.includes('index.html')) {
    window.location.href = 'login.html';
  } else if (currentUser && document.getElementById('username')) {
    document.getElementById('username').textContent = currentUser;
  }

  // Navegación
  const links = document.querySelectorAll('nav a');
  const contents = document.querySelectorAll('.content');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href').substring(1);
      contents.forEach(content => content.style.display = 'none');
      const targetElement = document.getElementById(target);
      if (targetElement) targetElement.style.display = 'block';
    });
  });

  // Menú hamburguesa
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      const navLinks = document.querySelector('.nav-links');
      navLinks.classList.toggle('active');
    });
  }

  // Cargar dispositivos guardados
  loadStoredDevices();

  // Agregar nuevo dispositivo
  const agregarBtn = document.getElementById('addDeviceBtn');
  if (agregarBtn) {
    agregarBtn.addEventListener('click', () => {
      Swal.fire({
        title: 'Agregar Dispositivo',
        html: `
          <input type="text" id="deviceName" class="swal2-input" placeholder="Nombre del dispositivo">
          <label style="display:block; margin-top:10px;">
            <input type="checkbox" id="deviceState"> ¿Encendido?
          </label>
        `,
        confirmButtonText: 'Agregar',
        focusConfirm: false,
        preConfirm: () => {
          const name = document.getElementById('deviceName').value.trim();
          const isOn = document.getElementById('deviceState').checked;

          if (!name) {
            Swal.showValidationMessage('El nombre no puede estar vacío');
            return false;
          }

          const existingDevices = JSON.parse(localStorage.getItem('devices')) || {};
          if (existingDevices[name]) {
            Swal.showValidationMessage('Ese nombre ya está en uso');
            return false;
          }

          return { name, isOn };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          addDeviceCard(result.value.name, result.value.isOn);
          storeDevice(result.value.name, result.value.isOn);
        }
      });
    });
  }
});




// Simulación de alertas recientes (puedes reemplazar esto con alertas reales en el futuro)
const alertasEjemplo = [
  { fecha: '2025-05-01 09:15', dispositivo: 'Aire Acondicionado', mensaje: 'Consumo inusual detectado' },
  { fecha: '2025-05-02 14:22', dispositivo: 'Refrigerador', mensaje: 'Puerta abierta por más de 5 minutos' },
  { fecha: '2025-05-03 08:10', dispositivo: 'Calentador', mensaje: 'Encendido fuera del horario programado' },
  { fecha: '2025-05-03 11:45', dispositivo: 'Luces Sala', mensaje: 'Consumo excede el límite configurado' }
];

// Función para cargar las alertas en la tabla
function cargarAlertas(alertas) {
  const tbody = document.getElementById('alertasTabla');
  tbody.innerHTML = ''; // Limpiar contenido anterior

  alertas.forEach(alerta => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${alerta.fecha}</td>
      <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${alerta.dispositivo}</td>
      <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${alerta.mensaje}</td>
    `;

    tbody.appendChild(fila);
  });
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  cargarAlertas(alertasEjemplo); // Puedes reemplazar esto con alertas reales
});


function togglePasswordVisibility() {
  const passwordInput = document.getElementById('loginPassword');
  const icon = document.querySelector('.toggle-password');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    icon.textContent = '👁️';
  }
}
function toggleRegisterPasswordVisibility() {
  const passwordInput = document.getElementById('registerPassword');
  const icon = passwordInput.nextElementSibling;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    icon.textContent = '👁️';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Mostrar plan guardado (si hay)
  const planGuardado = localStorage.getItem('planSeleccionado');
  if (planGuardado) {
    document.getElementById('nombre-plan').textContent = planGuardado;
  }

  // Escuchar clics en botones de planes
  document.querySelectorAll('.pricing-card .button').forEach(button => {
    button.addEventListener('click', () => {
      const plan = button.parentElement.querySelector('h3').textContent;

      Swal.fire({
        title: '¿Confirmar suscripción?',
        text: `¿Deseas suscribirte al ${plan}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, suscribirme',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Mostrar en pantalla
          document.getElementById('nombre-plan').textContent = plan;

          // Guardar en localStorage
          localStorage.setItem('planSeleccionado', plan);

          Swal.fire({
            title: '¡Suscripción exitosa!',
            text: `Te has suscrito al ${plan}.`,
            icon: 'success',
            confirmButtonColor: '#4CAF50'
          });
        }
      });
    });
  });
});


