const API_URL = 'https://fakestoreapi.com/products';

function traducirDescripcion(texto) {
  if (!texto) return 'Sin descripción disponible.';

  const traducciones = {
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'E': 'E',
    'F': 'F',
    'G': 'G',
    'H': 'H',
    'I': 'I',
    'J': 'J',
    'K': 'K',
    'L': 'L',
    'M': 'M',
    'N': 'N',
    'O': 'O',
    'P': 'P',
    'Q': 'Q',
    'R': 'R',
    'S': 'S',
    'T': 'T',
    'U': 'U',
    'V': 'V',
    'W': 'W',
    'X': 'X',
    'Y': 'Y',
    'Z': 'Z'
  };

  const descripcion = texto.trim();

  if (descripcion.length <= 0) {
    return 'Sin descripción disponible.';
  }

  return descripcion;
}

async function obtenerProductos() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error al cargar productos: ${response.status}`);
    }

    const productos = await response.json();
    return productos;
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    return [];
  }
}

function mostrarCatalogo(productos) {
  const catalogo = document.getElementById('catalogo');

  if (!catalogo) return;

  catalogo.innerHTML = productos
    .map(
      (producto) => `
        <div class="col-md-4 col-lg-3">
          <div class="card h-100 shadow-sm">
            <img src="${producto.image}" class="card-img-top p-3" alt="${producto.title}" style="height: 220px; object-fit: contain;" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${producto.title}</h5>
              <p class="card-text text-muted mb-3">${producto.category}</p>
              <div class="mt-auto">
                <p class="fw-bold mb-2">$${producto.price}</p>
                <button class="btn btn-primary w-100" data-id="${producto.id}">Ver detalles</button>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  catalogo.querySelectorAll('button[data-id]').forEach((boton) => {
    boton.addEventListener('click', () => {
      mostrarDetalles(Number(boton.dataset.id));
    });
  });
}

function mostrarOfertas(productos) {
  const ofertas = document.getElementById('ofertas');

  if (!ofertas) return;

  const productosOferta = [productos[0], productos[3], productos[6]].filter(Boolean);

  ofertas.innerHTML = productosOferta
    .map(
      (producto) => `
        <div class="col-md-4">
          <div class="card border-warning shadow-sm h-100">
            <div class="card-body">
              <span class="badge bg-warning text-dark mb-2">Oferta</span>
              <h5 class="card-title">${producto.title}</h5>
              <img src="${producto.image}" alt="${producto.title}" class="img-fluid mb-3" style="height: 180px; object-fit: contain; width: 100%;" />
              <p class="fw-bold mb-0">$${producto.price}</p>
            </div>
          </div>
        </div>
      `
    )
    .join('');
}

function mostrarCarrusel(productos) {
  const carrusel = document.getElementById('carrusel') || document.querySelector('#carousel');
  const carruselInner = carrusel ? carrusel.querySelector('.carousel-inner') : null;

  if (!carruselInner) return;

  const productosAleatorios = [...productos]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  carruselInner.innerHTML = productosAleatorios
    .map(
      (producto, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <img src="${producto.image}" class="d-block w-100" alt="${producto.title}" style="height: 360px; object-fit: contain; background: #f8f9fa;" />
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3 rounded">
            <h5>${producto.title}</h5>
            <button class="btn btn-light btn-sm" data-id="${producto.id}">Ver más</button>
          </div>
        </div>
      `
    )
    .join('');

  carruselInner.querySelectorAll('button[data-id]').forEach((boton) => {
    boton.addEventListener('click', () => {
      mostrarDetalles(Number(boton.dataset.id));
    });
  });
}

async function mostrarDetalles(idProducto) {
  try {
    const response = await fetch(`${API_URL}/${idProducto}`);

    if (!response.ok) {
      throw new Error(`Error al cargar detalle: ${response.status}`);
    }

    const producto = await response.json();
    const detalleContenido = document.getElementById('detalleContenido');

    if (!detalleContenido) return;

    detalleContenido.innerHTML = `
      <div class="row align-items-center">
        <div class="col-md-5">
          <img src="${producto.image}" alt="${producto.title}" class="img-fluid" style="max-height: 320px; object-fit: contain;" />
        </div>
        <div class="col-md-7">
          <h4>${producto.title}</h4>
          <p class="text-muted">${producto.category}</p>
          <p>${traducirDescripcion(producto.description)}</p>
          <p class="fw-bold fs-4">$${producto.price}</p>
          <p><strong>Calificación:</strong> ${producto.rating?.rate ?? 'N/A'} / 5</p>
        </div>
      </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('detalleProducto'));
    modal.show();
  } catch (error) {
    console.error('Error en mostrarDetalles:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const productos = await obtenerProductos();
  mostrarOfertas(productos);
  mostrarCarrusel(productos);
  mostrarCatalogo(productos);
});
