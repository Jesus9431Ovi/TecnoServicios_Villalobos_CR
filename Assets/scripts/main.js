/* =====================================================
   TECNOSERVICIOS VILLALOBOS CR
   Archivo: main.js
   Qué hace este archivo:
   - Controla el menú móvil (abrir/cerrar, accesibilidad).
   - Valida el formulario de contacto y muestra mensajes.
   - Limpia el campo de teléfono mientras se escribe.
   - Hace comprobaciones de diagnóstico en la consola.
===================================================== */

/* =====================================================
   1. ELEMENTOS DEL DOM
   Aquí "capturamos" los elementos del HTML para poder
   manipularlos desde JavaScript.
   - querySelector("selector")    -> devuelve el PRIMER elemento que coincida (o null si no existe).
   - querySelectorAll("selector") -> devuelve TODOS los que coincidan (NodeList, vacía si no hay).
   Selectores: "#" = id, "." = clase.
===================================================== */
// Botón hamburguesa que abre/cierra el menú en móvil.
const botonMenu = document.querySelector("#menu-toggle");
// Contenedor <nav> con los enlaces del menú.
const navegacionPrincipal = document.querySelector("#menu-principal");
// const enlacesMenu = navegacionPrincipal ? navegacionPrincipal.querySelectorAll("a"): [];
//  toma TODOS los <a> de la página (menú, hero, footer...).
const enlacesMenu = document.querySelectorAll("a");
// Elementos que solo se usan para el diagnóstico.
const tituloHero = document.querySelector(".hero-title");
const seccionServicios = document.querySelector("#servicios");
const tarjetasServicios = document.querySelectorAll(".tarjeta-servicio");
// Formulario y el párrafo donde se muestran los mensajes de éxito/error.
const formularioContacto = document.querySelector("#formulario-contacto");
const mensajeFormulario = document.querySelector("#mensaje-formulario");
// Ícono dentro del botón del menú (☰ / ✕). El selector [aria-hidden='true']
// busca el elemento hijo que está oculto para lectores de pantalla (es decorativo).
const menuIcono = document.querySelector("#menu-toggle [aria-hidden='true']");
// Campo de teléfono del formulario.
const campoTelefono = document.querySelector("#telefono");

/* =====================================================
   2. VARIABLES Y COMPROBACIÓN DEL DOM
===================================================== */
// matchMedia permite usar media queries de CSS desde JavaScript.
// Devuelve un objeto con:
//   .matches -> true si la pantalla cumple la condición ahora mismo
//   evento "change" -> se dispara cuando la pantalla pasa a cumplirla o dejar de cumplirla
// 48rem = 768px con base de 16px. Coincide con el punto de corte del CSS (@media (width < 48rem)).
const pantallaAncha = window.matchMedia("(min-width: 48rem)");

// Lista de elementos que queremos comprobar en la consola.
const elementosEsperados = [
  { nombre: "Botón del menú", selector: "#menu-toggle o #btn-menu", resultado: botonMenu, obligatorio: true },
  { nombre: "Navegación principal", selector: "#menu-principal o clase de navegación", resultado: navegacionPrincipal, obligatorio: true },
  { nombre: "Enlaces del menú", selector: "enlaces dentro de la navegación", resultado: enlacesMenu, obligatorio: true },
  { nombre: "Título principal", selector: ".hero-title", resultado: tituloHero, obligatorio: false },
  { nombre: "Sección de servicios", selector: "#servicios", resultado: seccionServicios, obligatorio: false },
  { nombre: "Tarjetas de servicios", selector: ".tarjeta-servicio o .tarjeta", resultado: tarjetasServicios, obligatorio: false },
  { nombre: "Formulario de contacto", selector: "#formulario-contacto", resultado: formularioContacto, obligatorio: false },
  { nombre: "Mensaje del formulario", selector: "#mensaje-formulario", resultado: mensajeFormulario, obligatorio: false }
];

// Informa si se encontraron los elementos esperados.
const comprobarElemento = ({ nombre, selector, resultado, obligatorio }) => {
  //    ¿Es una lista (querySelectorAll) o un solo elemento?
  const esLista = resultado instanceof NodeList || Array.isArray(resultado);
  // Cantidad: largo de la lista, o 1/0 si es un elemento único (Number(true)=1, Number(false)=0).
  const cantidad = esLista ? resultado.length : Number(resultado !== null);
  if (cantidad > 0) {
    console.info(`✅ ${nombre} (${selector}): ${cantidad} encontrado(s).`, resultado);
  } else if (obligatorio) {
    console.error(`❌ No se encontró ${nombre}. Revisa: ${selector}.`);
  } else {
    console.warn(`⚠️ No se encontró ${nombre} (${selector}).`);
  }
};


/* =====================================================
   3. COMPROBACIÓN DE ENLACES INTERNOS
===================================================== */

// Comprueba que los enlaces como #inicio y #servicios
// apunten a secciones que realmente existan.
const comprobarEnlacesMenu = () => {
  // Recorre cada <a> de la página.
  enlacesMenu.forEach((enlace) => {
    // getAttribute("href") devuelve el texto exacto escrito en el HTML (ej. "#inicio").
    const destino = enlace.getAttribute("href");
    // Se omiten: enlaces sin href, enlaces que NO empiezan con "#" (externos, mailto, tel...)
    // y el enlace "#" solo (no apunta a ningún id).

    if (!destino || !destino.startsWith("#") || destino === "#") {
      console.info("ℹ️ Se omite un enlace no interno:", enlace);
      return;// return dentro de forEach = pasa al siguiente enlace.
    }

    // slice(1) quita el "#": "#servicios" -> "servicios".
    let idDestino = destino.slice(1);

    try {
      // Convierte códigos como %C3%B1 en "ñ" para poder buscar ids con tildes.
      idDestino = decodeURIComponent(idDestino);
    } catch {
    }
    // Busca en todo el documento un elemento con ese id.
    const existe = document.getElementById(idDestino);

    if (existe) {
      console.info(`✅ "${enlace.textContent.trim()}" apunta a ${destino}.`);
    } else {
      console.error(`❌ El destino ${destino} no existe en el HTML.`);
    }
  });
};


/* =====================================================
   4. FUNCIONES DEL MENÚ MÓVIL
===================================================== */

// Función central: abre (true) o cierra (false) el menú.
// Mantiene sincronizados tres cosas: la clase CSS, el atributo ARIA y el ícono.
const establecerMenu = (abierto) => {
  // Si falta el botón o el menú, no hace nada (evita errores).
  if (!botonMenu || !navegacionPrincipal) return;

  // classList.toggle("clase", true/false): true la agrega, false la quita.
  // En el CSS, .navegacion.is-open { display: flex } muestra el menú en móvil.
  navegacionPrincipal.classList.toggle("is-open", abierto);
  // aria-expanded informa a lectores de pantalla si el menú está desplegado.
  // Los atributos siempre son texto, por eso String(true) -> "true".
  botonMenu.setAttribute("aria-expanded", String(abierto));
  // Cambia el ícono: ✕ cuando está abierto, ☰ cuando está cerrado.
  if (menuIcono) menuIcono.textContent = abierto ? "✕" : "☰";
};

// Invierte el estado actual: si estaba abierto lo cierra y viceversa.
const alternarMenu = () => {
  if (!botonMenu) return;
  // Lee el estado real desde aria-expanded (esa es la "fuente de verdad").

  const estaAbierto = botonMenu.getAttribute("aria-expanded") === "true";

  establecerMenu(!estaAbierto); // ! invierte el valor booleano.
};

// Atajo para cerrar el menú.
const cerrarMenu = () => {
  establecerMenu(false);
};

// Cierra el menú al presionar la tecla Escape (buena práctica de accesibilidad).
// "evento" es el objeto que el navegador entrega con información de la tecla.
const cerrarConEscape = (evento) => {
  if (!botonMenu) return;

  const estaAbierto = botonMenu.getAttribute("aria-expanded") === "true";
  // Solo actúa si se presionó Escape Y el menú está abierto.
  if (evento.key === "Escape" && estaAbierto) {
    cerrarMenu();
    // Devuelve el foco al botón para que quien navega con teclado no se "pierda".
    botonMenu.focus();
  }
};


/* =====================================================
   5. EVENTOS DEL MENÚ
      addEventListener("evento", función) = "cuando ocurra X, ejecuta Y".
===================================================== */

// Solo se registran los eventos si existen los dos elementos clave.
if (botonMenu && navegacionPrincipal) {
  // Clic en el botón hamburguesa -> abrir/cerrar.
  botonMenu.addEventListener("click", alternarMenu);
  // Cualquier tecla presionada en la página -> revisa si fue Escape.
  document.addEventListener("keydown", cerrarConEscape);
  // Clic en cualquier enlace -> cerrar el menú (útil en móvil tras elegir una sección).
  // Se pasa una función flecha que envuelve cerrarMenu.
  enlacesMenu.forEach((enlace) => { enlace.addEventListener("click", cerrarMenu); });

  // Escucha cuando la pantalla cruza el límite de 48rem.
  // evento.matches === true significa que ahora es pantalla ancha (escritorio).
  // Se cierra el menú para que no quede con estado "abierto" al volver a móvil.
  pantallaAncha.addEventListener("change", (evento) => {
    if (evento.matches) {
      cerrarMenu();
    }
  });

  // Estado inicial al cargar: menú cerrado, aria-expanded="false" e ícono ☰.
  establecerMenu(false);
}


/* =====================================================
   6. VALIDACIÓN DEL FORMULARIO — 
===================================================== */
// Solo se ejecuta si el formulario y el espacio para mensajes existen.
if (formularioContacto && mensajeFormulario) {
  // "submit" se dispara al presionar el botón de enviar (o Enter en un campo).
  formularioContacto.addEventListener("submit", (evento) => {
    // preventDefault() cancela el envío normal (que recargaría la página).
    // Necesario porque aún no hay servidor que reciba los datos.
    evento.preventDefault();

    // checkValidity() devuelve true si TODOS los campos cumplen sus reglas HTML
    // (required, type="email", minlength, pattern, etc.).
    if (!formularioContacto.checkValidity()) {
      // reportValidity() muestra las burbujas nativas del navegador con el error
      // y enfoca el primer campo inválido.
      formularioContacto.reportValidity();
      // formularioContacto.querySelector(":invalid").focus() <- alternativa manual para enfocar.
      // ":invalid" es una pseudo-clase: selecciona el primer campo que no pasó la validación.
      const campoInvalido = formularioContacto.querySelector(":invalid");
      // Busca la <label> asociada mediante for="id_del_campo".
      // Si no hay campo inválido, etiqueta queda en null.
      const etiqueta = campoInvalido
        ? document.querySelector(`label[for="${campoInvalido.id}"]`)
        : null;
      // Mensaje personalizado: con el nombre del campo si se encontró su label,
      // o un mensaje genérico si no.
      mensajeFormulario.textContent = etiqueta
        ? `Revisa el campo "${etiqueta.textContent.trim()}" antes de continuar.`
        : "Revisa los campos señalados antes de continuar.";

      // Cambia el estilo del mensaje a "error" (rojo en el CSS).
      mensajeFormulario.classList.remove("mensaje-exito");
      mensajeFormulario.classList.add("mensaje-error");

      return;
    }
    // Si llegó aquí, el formulario es válido.
    mensajeFormulario.textContent = "Validación completada.";
    // reset() vacía todos los campos del formulario.
    formularioContacto.reset()
    // Estilo de "éxito" (verde en el CSS).
    mensajeFormulario.classList.remove("mensaje-error");
    mensajeFormulario.classList.add("mensaje-exito");
  });
}
// Filtro en vivo para el teléfono.
if (campoTelefono) {
  // El evento "input" se dispara con cada tecla escrita o texto pegado.
  campoTelefono.addEventListener("input", () => {
    // Elimina todo lo que no sea número, +, guion, espacio o paréntesis
    // Expresión regular: [^...] significa "cualquier carácter que NO sea...".
    // Permitidos: dígitos 0-9, +, guion (\-), espacio (\s) y paréntesis.
    // /g = reemplazar todas las coincidencias, no solo la primera.
    // Lo no permitido se reemplaza por "" (se borra).
    campoTelefono.value = campoTelefono.value.replace(/[^0-9+\-\s()]/g, "");
  });
}

/* =====================================================
   7. INICIALIZACIÓN Y DIAGNÓSTICO 
===================================================== */

// Mensaje para confirmar en la consola que el archivo cargó.
console.info("main.js cargado correctamente.");

// Comprueba los elementos del DOM.
elementosEsperados.forEach(comprobarElemento);

// Comprueba los destinos de los enlaces internos.
comprobarEnlacesMenu();
// const DEBUG = false;
// if (DEBUG) { elementosEsperados.forEach(comprobarElemento); comprobarEnlacesMenu(); }