let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarServicios();

    //resalta el div actual segun el tab al que se presiona
    mostrarSeccion();

    //oculta o muestra una seccion segun el tab al que se presiona
    cambiarSeccion();

    //paginacion siguiente y anterior
    paginaSiguiente();

    paginaAnterior();

    //Comprueba la pagina actual para ocultar o mostrar la paginacion
    botonesPaginador();

    //mostrar el resumen de la cita o mensaje de cerror en caso de no pasar validacion
    mostrarResumen();

    //almacena el nombre de la cita en el objeto
    nombreCita();

    //almacena la fecha de la cita en el objeto

}

function mostrarSeccion() {
    //eliminar mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');

    if( seccionAnterior ) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }

    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    //eliminar la clase de actual en el tab anterior
    const tabAnterior = document.querySelector('.tabs .actual')

    if ( tabAnterior ) {
        tabAnterior.classList.remove('actual');
    }

    //resalta el tab actual
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();

            pagina = parseInt( e.target.dataset.paso );

            //llamar la funcion de mostrar seccion
            mostrarSeccion();

            botonesPaginador();
        })
    })
}

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();

        const { servicios } = db;

       // Generar el HTML
       servicios.forEach( servicio => {
            const { id, nombre, precio } = servicio;

            // DOM Scripting
            // Generar nombre de servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            // Generar el precio del servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            // Generar div contenedor de servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            // Selecciona un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;

            // Inyectar precio y nombre al div de servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            // Inyectarlo en el HTML
            document.querySelector('#servicios').appendChild(servicioDiv);
       } )
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    let elemento;

    //forzar que el elemento al que le damos click sea el DIV
    if( e.target.tagName === 'P' ) {
        elemento = e.target.parentElement
    } else {
        elemento = e.target;
    }

    if( elemento.classList.contains('seleccionado') ) {
        elemento.classList.remove('seleccionado')

        const id = parseInt( elemento.dataset.idServicio );

        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        const servicioObj = {
            id: parseInt ( elemento.dataset.idServicio ),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent,
        }

        //console.log(servicioObj)

        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id) {
    const { servicios } = cita;

    cita.servicios = servicios.filter( servicio => servicio.id !== id );

    console.log(cita);
}

function agregarServicio(servicioObj) {
    const { servicios } = cita;

    cita.servicios = [ ...servicios, servicioObj ];

    console.log(cita);
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;

        botonesPaginador();
    })
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;

        botonesPaginador();
    })
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if( pagina === 1 ) {
        paginaAnterior.classList.add('ocultar');
    } else if ( pagina === 3 ) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');
    } else {
        paginaAnterior.classList.remove('oculta');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion(); //cambia la seccion que se muestra por la de la pagina
}

function mostrarResumen() {
    //destructuring
    const { nombre, fecha, hora, servicios } = cita;

    //seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //validacion
    if( Object.values(cita).includes('') ) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de servicios, hora, fecha o nombre';
        noServicios.classList.add('invalidar-cita');

        //agregar a resumen Div
        resumenDiv.appendChild(noServicios);
    }
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', e => {
        const nombreTexto = e.target.value.trim();

        //validacion de que nombreTexto debe tener algo
        if( nombreTexto === '' || nombreTexto.length < 4) {
            mostrarAlerta('Nombre no valido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');

            if( alerta ) {
                alerta.remove();
            }

            cita.nombre = nombreTexto;
        }
    })
}

function mostrarAlerta(mensaje, tipo) {
    //si hay alerta previa, no crear otra
    const alertaPrevia = document.querySelector('.alerta');

    if( alertaPrevia ) {
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje; 
    alerta.classList.add('alerta');

    if( tipo === 'error' ) {
        alerta.classList.add('error')
    }

    //insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild( alerta );

    //eliminar la alerta despues de unos segundos
    setTimeout(() => {
        alerta.remove();
    }, 2000);
}

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e => {

        const dia = new Date(e.target.value).getUTCDay();
        
        if([0, 6].includes(dia)) {
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de Semana no son permitidos', 'error');
        } else {
            cita.fecha = fechaInput.value;

            console.log(cita);
        }
    })
}


//////////////////////////////////////////////////////////////////////////////////////////////

//TRAEMOS MUSEOS
async function mostrarMuseos() {
    try {
      const resultado = await fetch('./museos.json');
      const db = await resultado.json();
      var { museos } = db;
  
      //GENERAR EL HTML
      museos.forEach( museo => {
        const { id, nombre, ciudad } = museo;
  
        //DOM SCRIPTING
        const nombreMuseo = document.createElement('P');
        nombreMuseo.textContent = nombre;
        nombreMuseo.classList.add('nombre-museo');
  
        //GENERAR DIV CONTENEDOR DE MUSEO
        const museoDiv = document.createElement('DIV');
        museoDiv.classList.add('museo');
  
        //INYECTAR NOMBRE AL DIV CONTENEDOR DE MUSEO.
        museoDiv.appendChild(nombreMuseo);
  
        //INYECTARLO EN EL HTML
        document.querySelector('#madrid').appendChild(museoDiv);
      } )
    } catch (error) {
      console.log(error);
    }
  }