/* ============================================================
   SCRIPT PRINCIPAL - Despedida de Soltero David Castro
   ============================================================
   
   📌 INSTRUCCIONES PARA EDITAR RETOS:
   
   Busca la sección "LISTA DE RETOS" más abajo.
   Cada reto tiene:
     - texto: el texto del reto que aparece al girar
     - emoji: el emoji que se muestra en el resultado
     - color: el color de la sección de la ruleta (en formato hex)
   
   Puedes añadir, quitar o modificar retos libremente.
   La ruleta se ajusta automáticamente al número de retos.
   
   ============================================================ */

// ============================================================
// =================== LISTA DE RETOS =========================
// ============================================================
// 
// 🎯 EDITA AQUÍ LOS RETOS:
// Añade o quita objetos del array para personalizar la ruleta.
// Cada objeto necesita: texto, emoji y color.
//
// Colores recomendados para la ruleta (alterna para que se vea bien):
// "#e11d48" (rojo), "#f59e0b" (dorado), "#8b5cf6" (morado), 
// "#22d3ee" (cian), "#34d399" (verde), "#f472b6" (rosa),
// "#fb923c" (naranja), "#60a5fa" (azul)
//
// ============================================================


// ============================================================
// =================== LLAVES / CÓDIGOS ======================
// ============================================================
//
// 🔑 EDITA AQUÍ LOS CÓDIGOS VÁLIDOS:
// Cada código sirve para abrir la caja UNA SOLA VEZ.
// Una vez usado, no vuelve a funcionar (se guarda en localStorage).
// Puedes poner cualquier texto como código (no distingue mayúsculas).
//
// Para añadir más: añade una cadena más al array.
// Para cambiar: simplemente edita el texto entre comillas.
//
// ============================================================

const LLAVES = [
    "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "15",
    "16", "17", "18", "19", "20", "21", "22",
    "23", "24", "25", "26", "27", "28", "29", "30", "31",

];

// ============================================================
// MOTOR DE SONIDO (Web Audio API - sin archivos externos)
// ============================================================
const SoundFX = (function () {
    let ctx = null;
    let muted = false;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // Genera una nota sintetizada con envolvente ADSR simplificada
    function nota(freq, dur, tipo = 'sine', volumen = 0.35, retardo = 0) {
        if (muted) return;
        const c = getCtx();
        const t = c.currentTime + retardo;
        const osc = c.createOscillator();
        const env = c.createGain();
        osc.connect(env);
        env.connect(c.destination);
        osc.type = tipo;
        osc.frequency.setValueAtTime(freq, t);
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(volumen, t + 0.012);
        env.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    // Genera ruido blanco con filtro y envolvente
    function ruido(dur, vol = 0.25, retardo = 0, corte = 600) {
        if (muted) return;
        const c = getCtx();
        const t = c.currentTime + retardo;
        const muestras = Math.ceil(c.sampleRate * dur);
        const buf = c.createBuffer(1, muestras, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < muestras; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;
        const filtro = c.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = corte;
        const env = c.createGain();
        src.connect(filtro);
        filtro.connect(env);
        env.connect(c.destination);
        env.gain.setValueAtTime(vol, t);
        env.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.start(t);
        src.stop(t + dur + 0.05);
    }

    return {
        // Alterna silencio
        toggle() {
            muted = !muted;
            return muted;
        },
        isMuted() { return muted; },

        // Click de la ruleta al pasar por cada tarjeta
        tick(velocidad = 1) {
            // La frecuencia del tick sube cuando la ruleta va rápido
            const freq = 600 + (1 - velocidad) * 400;
            nota(freq, 0.045, 'square', 0.18);
        },

        // Rumble / vibración de la caja
        shake() {
            ruido(0.55, 0.15, 0, 180);
            nota(70, 0.55, 'sine', 0.12);
            nota(110, 0.4, 'sine', 0.08, 0.05);
        },

        // Whoosh ascendente al abrir la tapa
        whoosh() {
            if (muted) return;
            const c = getCtx();
            // Barrido de frecuencia
            const osc = c.createOscillator();
            const env = c.createGain();
            osc.connect(env);
            env.connect(c.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2200, c.currentTime + 0.75);
            env.gain.setValueAtTime(0.28, c.currentTime);
            env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.75);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + 0.8);
            // Capa de ruido filtrado
            ruido(0.65, 0.1, 0, 2000);
        },

        // Impacto del flash (boom)
        flash() {
            nota(1400, 0.25, 'sine', 0.45);
            nota(700, 0.3, 'sine', 0.2, 0.02);
            ruido(0.2, 0.3, 0, 4000);
        },

        // Fanfarria ganadora
        winner() {
            // Melodía ascendente
            const mel = [523, 659, 784, 1047, 1319];
            mel.forEach((f, i) => nota(f, 0.4, 'sine', 0.35, i * 0.1));
            // Armonía
            const arm = [659, 784, 988, 1319];
            arm.forEach((f, i) => nota(f, 0.3, 'triangle', 0.15, i * 0.1 + 0.05));
            // Shimmer final
            nota(2093, 0.5, 'sine', 0.2, 0.4);
        },

        // Pop de confetti
        confetti() {
            [784, 880, 988, 1175, 1319].forEach((f, i) =>
                nota(f, 0.22, 'sine', 0.2, i * 0.07)
            );
        }
    };
})();

// Función global para el botón de mute
function toggleMute() {
    const silenciado = SoundFX.toggle();
    const btn = document.getElementById('mute-btn');
    const icon = document.getElementById('mute-icon');
    if (btn) btn.classList.toggle('muted', silenciado);
    if (icon) icon.textContent = silenciado ? '🔇' : '🔊';
}

// ============================================================
// ============= FIN DE LLAVES / CÓDIGOS =====================
// ============================================================

const RETOS = [
    {
        texto: "Llama a Lorena y dile que has perdido el anillo 💍😱",
        emoji: "📞",
        color: "#e11d48"
    },
    {
        texto: "Haz 20 flexiones ahora mismo o paga una ronda 💪",
        emoji: "🏋️",
        color: "#f59e0b"
    },
    {
        texto: "Imita a tu suegra durante 2 minutos 😂",
        emoji: "🎭",
        color: "#8b5cf6"
    },
    {
        texto: "Canta una canción a un desconocido 🎤",
        emoji: "🎵",
        color: "#22d3ee"
    },
    {
        texto: "Cuenta tu momento más vergonzoso delante de todos 😳",
        emoji: "🫣",
        color: "#34d399"
    },
    {
        texto: "Baila reguetón durante 1 minuto sin parar 💃",
        emoji: "🕺",
        color: "#f472b6"
    },
    {
        texto: "Pide una bebida en un bar hablando solo con mímica 🤐",
        emoji: "🍹",
        color: "#fb923c"
    },
    {
        texto: "Publica una historia de Instagram diciendo cuánto quieres a Lorena 📱",
        emoji: "❤️",
        color: "#60a5fa"
    },
    {
        texto: "Haz una foto con 5 desconocidos en menos de 3 minutos 📸",
        emoji: "📸",
        color: "#e11d48"
    },
    {
        texto: "Déjate poner un peinado ridículo y llévalo toda la noche 💇",
        emoji: "💇",
        color: "#f59e0b"
    },
    {
        texto: "Di un piropo gracioso a la siguiente persona que pase 😏",
        emoji: "😘",
        color: "#8b5cf6"
    },
    {
        texto: "Chupito sorpresa elegido por tus amigos 🥃",
        emoji: "🥃",
        color: "#22d3ee"
    },
    {
        texto: "¡Preguntas de cultura general! Demuestra que no eres un ignorante 🧠",
        emoji: "🧠",
        color: "#6366f1",
        quiz: true
    },
    {
        texto: "Habla con un acento que no sea el tuyo durante 1 hora completa 🗣️",
        emoji: "🗣️",
        color: "#f472b6"
    },
    {
        texto: "Bebe lo que tengas delante sin usar las manos 🍺",
        emoji: "🍺",
        color: "#fb923c"
    },
    {
        texto: "Lleva la ropa del revés durante la siguiente hora 👕",
        emoji: "👕",
        color: "#60a5fa"
    },
    {
        texto: "Para a una pareja mayor por la calle y pregúntales el secreto del amor 💑",
        emoji: "💑",
        color: "#e11d48"
    },
    {
        texto: "Pídele una foto a quien el grupo elija (para el vídeo de recuerdo 😂) 🤳",
        emoji: "🤳",
        color: "#f59e0b"
    },
    {
        texto: "No puedes decir que NO a nada durante el resto de la noche 😈",
        emoji: "😈",
        color: "#8b5cf6"
    },
    {
        texto: "Ronda de chupitos sin usar las manos — todos a la vez 🔥",
        emoji: "🔥",
        color: "#22d3ee"
    },
    {
        texto: "Improvisa una coreografía en plena calle y aguanta 30 segundos sin parar 🕺",
        emoji: "💃",
        color: "#34d399"
    },
    {
        texto: "Sé guía turístico 5 minutos: explica monumentos inventados como historia real 🏛️",
        emoji: "🏛️",
        color: "#f472b6"
    },
    {
        texto: "Elige un 'objeto sagrado' y protégelo toda la noche como el anillo de Frodo ⚔️",
        emoji: "⚔️",
        color: "#fb923c"
    },
    {
        texto: "Haz entrevistas falsas de reportero de televisión a quien el grupo elija 🎤",
        emoji: "🎙️",
        color: "#60a5fa"
    },
    {
        texto: "Te pones las uñas postizas que lleva Lorena y las llevas 30 minutos 💅",
        emoji: "💅",
        color: "#e11d48"
    }
];

// ============================================================
// ===================== FIN DE RETOS =========================
// ============================================================


// ============================================================
// VARIABLES GLOBALES
// ============================================================
let girando = false;              // Controla si la caja está girando
let historialRetos = [];          // Historial de retos que han salido
let retosUsados = [];             // Índices de RETOS ya mostrados (no vuelven a salir)
let llavesUsadas = [];            // Códigos de llave ya canjeados (se guardan en LS)

// Tamaño de cada tarjeta + margen (px)
const ITEM_W = 162; // 150px ancho + 6px margen a cada lado

// Devuelve los retos que todavía no han salido
function getRetosActivos() {
    return RETOS.map((r, i) => ({ ...r, _idx: i }))
        .filter(r => !retosUsados.includes(r._idx));
}


// ============================================================
// LOCALSTORAGE - CLAVES
// ============================================================
const LS_HISTORIAL = 'despedida_david_historial';
const LS_USADOS = 'despedida_david_usados';
const LS_LLAVES_USADAS = 'despedida_david_llaves_usadas'; // llaves ya canjeadas

// Guarda el estado actual en localStorage
function guardarEstado() {
    localStorage.setItem(LS_HISTORIAL, JSON.stringify(historialRetos));
    localStorage.setItem(LS_USADOS, JSON.stringify(retosUsados));
}

// Guarda las llaves usadas
function guardarLlavesUsadas() {
    localStorage.setItem(LS_LLAVES_USADAS, JSON.stringify(llavesUsadas));
}

// Carga el estado guardado desde localStorage
function cargarEstado() {
    const historialGuardado = localStorage.getItem(LS_HISTORIAL);
    const usadosGuardado = localStorage.getItem(LS_USADOS);
    const llavesUsadasGuardado = localStorage.getItem(LS_LLAVES_USADAS);

    if (historialGuardado) historialRetos = JSON.parse(historialGuardado);
    if (usadosGuardado) retosUsados = JSON.parse(usadosGuardado);
    if (llavesUsadasGuardado) llavesUsadas = JSON.parse(llavesUsadasGuardado);
}

// Borra todo el estado guardado
function borrarEstado(resetLlaves = false) {
    localStorage.removeItem(LS_HISTORIAL);
    localStorage.removeItem(LS_USADOS);
    // Si se pide, también borrar las llaves usadas
    if (resetLlaves) {
        localStorage.removeItem(LS_LLAVES_USADAS);
    }
}


// ============================================================
// ACTUALIZAR CONTADOR DE RETOS RESTANTES
// ============================================================
function actualizarRetosRestantes() {
    const restantes = getRetosActivos().length;
    const el = document.getElementById('caja-retos-restantes');
    if (!el) return;
    if (restantes === 0) {
        el.textContent = '🎉 ¡Todos los retos completados!';
    } else {
        el.textContent = `${restantes} reto${restantes !== 1 ? 's' : ''} restante${restantes !== 1 ? 's' : ''}`;
    }
}


// ============================================================
// CONSTRUIR LA TIRA DE RETOS (estilo apertura de caja CS:GO)
// ============================================================
// totalItems: número total de tarjetas a generar en la tira
// winnerIndex: posición dentro de la tira donde queremos que caiga el ganador
function construirTira(retosActivos, winnerRetoIdx, totalItems, winnerPos) {
    const tira = document.getElementById('caja-tira');
    tira.innerHTML = '';

    for (let i = 0; i < totalItems; i++) {
        // Escoge un reto aleatorio de los activos para cada posición,
        // pero la posición winnerPos usa exactamente el ganador.
        const reto = (i === winnerPos)
            ? retosActivos[winnerRetoIdx]
            : retosActivos[Math.floor(Math.random() * retosActivos.length)];

        const div = document.createElement('div');
        div.className = 'caja-item';
        div.style.setProperty('--item-color', reto.color);
        if (i === winnerPos) div.dataset.ganador = '1';

        let textoCorto = reto.texto;
        if (textoCorto.length > 55) textoCorto = textoCorto.substring(0, 53) + '…';

        div.innerHTML = `
            <span class="caja-item-emoji">${reto.emoji}</span>
            <span class="caja-item-texto">${textoCorto}</span>
        `;
        tira.appendChild(div);
    }
}


// ============================================================
// MODAL DE LLAVE / SISTEMA DE PAGO
// ============================================================

// Mensajes graciosos para pagos falsos rechazados
const MENSAJES_RECHAZO = {
    tarjeta: [
        '"Su tarjeta ha sido rechazada. Llame a su banco para saber por qué no tiene dinero." 💳😅',
        'Error 402: Fondos insuficientes. ¿Has mirado cuanto te queda en la cuenta? 🤔',
        'Transacción denegada. Su banco sospecha que está de despedida y ha bloqueado la tarjeta. 🔒'
    ],
    bizum: [
        'Bizum rechazado. Resulta que tu contacto no tiene Bizum... ni bancos en los que confiar. 📱',
        'El bizum volvió de donde vino. Parece que nadie quiere tu dinero. 🤷',
        'Error de Bizum: Saldo insuficiente. Pon aunque sea para la siguiente ronda. 🍺'
    ],
    paypal: [
        'PayPal ha detectado actividad sospechosa: alguien intentando divertirse en una despedida. Bloqueado. 🚫',
        'Su cuenta PayPal está limitada. Probablemente porque lleva años sin pagar nada. 😂',
        'PayPal no está disponible en este momento (ni nunca para ti). 🤷‍♂️'
    ],
    crypto: [
        'Bitcoin no encontrado en tu cartera. Quizás deberías haber HODL más. 📉',
        'La blockchain confirmó la transacción... y luego la canceló. Karma. ⚡',
        'Error: gas fee mayor que tu saldo total. ETH no es para los pobres. 😂'
    ]
};

// Muestra el modal de llave
function mostrarModalLlave() {
    const overlay = document.getElementById('llave-overlay');
    overlay.classList.add('visible');
    mostrarMetodosLlave();
}

// Cierra el modal de llave
function cerrarModalLlave() {
    document.getElementById('llave-overlay').classList.remove('visible');
}

// Muestra el panel principal de métodos de pago
function mostrarMetodosLlave() {
    document.getElementById('llave-metodos').style.display = 'block';
    document.getElementById('llave-codigo-panel').classList.remove('active');
    document.getElementById('llave-procesando').classList.remove('active');
    document.getElementById('llave-rechazado').classList.remove('active');
    // Limpiar error y campo
    document.getElementById('llave-codigo-error').textContent = '';
    const input = document.getElementById('llave-codigo-input');
    if (input) input.value = '';
}

// Selecciona un método de pago
function seleccionarPago(metodo) {
    if (metodo === 'regalo') {
        // Mostrar panel de código real
        document.getElementById('llave-metodos').style.display = 'none';
        document.getElementById('llave-codigo-panel').classList.add('active');
        setTimeout(() => {
            document.getElementById('llave-codigo-input').focus();
        }, 100);
        return;
    }

    // Para los demás: simular procesando y luego rechazar con humor
    document.getElementById('llave-metodos').style.display = 'none';
    const procesando = document.getElementById('llave-procesando');
    procesando.classList.add('active');

    const pasos = [
        'Conectando con el servidor...',
        'Verificando datos...',
        'Procesando pago...',
        'Confirmando transacción...'
    ];
    let paso = 0;
    const textoEl = document.getElementById('llave-procesando-texto');
    textoEl.textContent = pasos[0];

    const intervalo = setInterval(() => {
        paso++;
        if (paso < pasos.length) {
            textoEl.textContent = pasos[paso];
        }
    }, 600);

    // Después de 2.8s: rechazar
    setTimeout(() => {
        clearInterval(intervalo);
        procesando.classList.remove('active');

        const mensajes = MENSAJES_RECHAZO[metodo] || MENSAJES_RECHAZO.tarjeta;
        const msg = mensajes[Math.floor(Math.random() * mensajes.length)];
        document.getElementById('llave-rechazado-msg').textContent = msg;
        document.getElementById('llave-rechazado').classList.add('active');
    }, 2800);
}

// Verifica el código de la tarjeta regalo
function verificarCodigo() {
    const input = document.getElementById('llave-codigo-input');
    const errorEl = document.getElementById('llave-codigo-error');
    const codigo = input.value.trim().toUpperCase();

    errorEl.textContent = '';

    if (!codigo) {
        errorEl.textContent = '¡Escribe un código antes de canjear! 🙃';
        return;
    }

    // Buscar el código en la lista (comparar sin importar mayúsculas)
    const codigoOriginal = LLAVES.find(l => l.toUpperCase() === codigo);

    if (!codigoOriginal) {
        errorEl.textContent = '❌ Código inválido. Comprueba que lo has escrito bien.';
        input.select();
        return;
    }

    // Comprobar si ya fue usado
    if (llavesUsadas.map(l => l.toUpperCase()).includes(codigo)) {
        errorEl.textContent = '🔒 Esta llave ya fue usada. Cada código solo sirve una vez.';
        input.select();
        return;
    }

    // ¡Código válido! Marcar como usado y abrir la caja
    llavesUsadas.push(codigoOriginal);
    guardarLlavesUsadas();

    cerrarModalLlave();

    // Pausa para que el modal desaparezca y luego animar la caja
    setTimeout(() => {
        animarAperturaCaja();
    }, 300);
}


// ============================================================
// ABRIR LA CAJA - PUNTO DE ENTRADA
// Comprueba si necesita llave antes de animar
// ============================================================
function girarRuleta() {
    if (girando) return;

    const retosActivos = getRetosActivos();
    if (retosActivos.length === 0) {
        alert('¡Todos los retos han sido completados! 🎉 Pulsa "Reiniciar" para volver a empezar.');
        return;
    }

    // Mostrar el modal de pago para obtener la llave
    mostrarModalLlave();
}


// ============================================================
// ANIMACIÓN DE APERTURA (se llama tras canjear una llave válida)
// ============================================================
function iniciarAperturaCaja() {
    if (girando) return;

    const retosActivos = getRetosActivos();
    if (retosActivos.length === 0) return;

    girando = true;
    const boton = document.getElementById('spin-button');
    boton.disabled = true;

    // ---- Elegir ganador ----
    const winnerRetoIdx = Math.floor(Math.random() * retosActivos.length);

    // ---- Configurar la tira ----
    // La tira tiene muchos items; el ganador cae en una posición
    // cercana al final para que haya mucho recorrido visible.
    const totalItems = 60;
    const winnerPos = totalItems - 8 - Math.floor(Math.random() * 4);

    construirTira(retosActivos, winnerRetoIdx, totalItems, winnerPos);

    // ---- Calcular cuánto desplazar la tira ----
    const ventana = document.getElementById('caja-ventana');
    const ventanaW = ventana.offsetWidth;
    const centerOfWinner = winnerPos * ITEM_W + ITEM_W / 2;
    const targetTranslate = ventanaW / 2 - centerOfWinner;
    const offset = (Math.random() - 0.5) * 60;
    const finalTranslate = targetTranslate + offset;

    // ---- Animar ----
    const duracion = 5000 + Math.random() * 1500;
    const inicio = performance.now();
    const tira = document.getElementById('caja-tira');
    tira.style.transform = 'translateX(0px)';

    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    let lastTickIndex = -1;

    function animar(ahora) {
        const transcurrido = ahora - inicio;
        const progreso = Math.min(transcurrido / duracion, 1);
        const progresoSuave = easeOutQuint(progreso);
        const translateX = finalTranslate * progresoSuave;

        tira.style.transform = `translateX(${translateX}px)`;

        // Parpadeo del indicador al pasar por cada tarjeta
        const centroVentana = ventanaW / 2;
        const indiceActual = Math.floor((centroVentana - translateX) / ITEM_W);
        if (indiceActual !== lastTickIndex && indiceActual >= 0 && indiceActual < totalItems) {
            lastTickIndex = indiceActual;
            // Sonido de tick (velocidad basada en el progreso: más rápido al inicio)
            SoundFX.tick(progresoSuave);
            const indTop = document.querySelector('.caja-indicador-top');
            const indBot = document.querySelector('.caja-indicador-bottom');
            if (indTop && indBot) {
                indTop.style.borderTopColor = '#fff';
                indBot.style.borderBottomColor = '#fff';
                setTimeout(() => {
                    indTop.style.borderTopColor = '#f59e0b';
                    indBot.style.borderBottomColor = '#f59e0b';
                }, 60);
            }
        }

        if (progreso < 1) {
            requestAnimationFrame(animar);
        } else {
            // Resaltar la tarjeta ganadora
            const items = document.querySelectorAll('.caja-item');
            if (items[winnerPos]) items[winnerPos].classList.add('ganador');

            // Pausa dramática antes de mostrar el resultado
            setTimeout(() => {
                mostrarResultado(retosActivos[winnerRetoIdx]);
                girando = false;
                boton.disabled = false;
            }, 800);
        }
    }

    requestAnimationFrame(animar);
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================
// Ahora recibe el objeto reto directamente (con ._idx = índice original en RETOS)
function mostrarResultado(reto) {
    document.getElementById('resultado-emoji').textContent = reto.emoji;
    document.getElementById('resultado-texto').textContent = reto.texto;
    document.getElementById('resultado-container').classList.add('visible');

    // Sonido de resultado ganador
    SoundFX.winner();

    // Si es el reto del quiz, el botón abre el quiz al pulsarlo
    const closeBtn = document.getElementById('resultado-close');
    if (reto.quiz) {
        closeBtn.textContent = '¡Abrir Quiz! 🧠';
        closeBtn.onclick = function () {
            cerrarResultado();
            abrirQuiz();
        };
    } else {
        closeBtn.textContent = '¡Entendido! 💪';
        closeBtn.onclick = cerrarResultado;
    }

    // Marcar reto como usado y guardarlo
    retosUsados.push(reto._idx);
    historialRetos.push(reto.texto);
    guardarEstado();
    actualizarHistorial();
    actualizarRetosRestantes();

    // Si ya no quedan retos, deshabilitar botón girar
    if (getRetosActivos().length === 0) {
        document.getElementById('spin-button').disabled = true;
        document.getElementById('spin-button').title = '¡Todos los retos completados!';
    }

    lanzarConfetti();
}


// ============================================================
// CERRAR RESULTADO
// ============================================================
function cerrarResultado() {
    document.getElementById('resultado-container').classList.remove('visible');
    guardarEstado();
    // Restaurar la caja a su estado cerrado
    resetCajaDisplay();
}


// ============================================================
// ANIMACIÓN DE APERTURA DE LA CAJA (antes del giro de la ruleta)
// ============================================================
function animarAperturaCaja() {
    const scene = document.getElementById('case-3d-scene');
    const display = document.getElementById('csgo-case-display');
    const beam = document.getElementById('case-light-beam');
    const rays = document.getElementById('case-rays');
    const flash = document.getElementById('case-flash');
    const instruc = document.getElementById('case-instruction');

    if (!scene) { iniciarAperturaCaja(); return; }

    // Ocultar instrucción
    if (instruc) instruc.style.opacity = '0';

    // ── Fase 1: vibración (0-560ms) ──────────────────────────
    scene.classList.add('case-shaking');
    SoundFX.shake(); // Sonido de rumble

    setTimeout(() => {
        scene.classList.remove('case-shaking');

        // ── Fase 2: abrir tapa + luz (560-1400ms) ────────────
        scene.classList.add('case-opening');
        if (beam) beam.classList.add('active');
        if (rays) rays.classList.add('active');
        SoundFX.whoosh(); // Sonido de whoosh al abrir la tapa

        // ── Fase 3: flash blanco (1100ms) ────────────────────
        setTimeout(() => {
            if (flash) flash.style.opacity = '0.92';
            SoundFX.flash(); // Impacto del flash

            setTimeout(() => {
                if (flash) flash.style.opacity = '0';

                // ── Fase 4: ocultar caja → iniciar ruleta ────
                if (display) display.classList.add('case-hidden');

                iniciarAperturaCaja();
            }, 280);
        }, 540);

    }, 560);
}


// ============================================================
// RESETEAR CAJA (vuelve a estado cerrado tras ver el resultado)
// ============================================================
function resetCajaDisplay() {
    const scene = document.getElementById('case-3d-scene');
    const display = document.getElementById('csgo-case-display');
    const beam = document.getElementById('case-light-beam');
    const rays = document.getElementById('case-rays');
    const instruc = document.getElementById('case-instruction');

    if (!scene || !display) return;

    // Quitar clases de apertura
    scene.classList.remove('case-opening', 'case-shaking');
    if (beam) beam.classList.remove('active');
    if (rays) rays.classList.remove('active');

    // Mostrar la caja de nuevo
    display.classList.remove('case-hidden');
    if (instruc) instruc.style.opacity = '1';
}


// ============================================================
// ACTUALIZAR HISTORIAL
// ============================================================
function actualizarHistorial() {
    const historialDiv = document.getElementById('historial');
    const lista = document.getElementById('historial-lista');
    const resetBtn = document.getElementById('reset-button');

    lista.innerHTML = '';

    if (historialRetos.length === 0) {
        historialDiv.classList.remove('visible');
        resetBtn.style.display = 'none';
        return;
    }

    historialDiv.classList.add('visible');
    resetBtn.style.display = 'inline-flex';

    historialRetos.forEach((texto, i) => {
        const li = document.createElement('li');
        li.className = 'historial-item';
        li.innerHTML = `
            <span class="historial-numero">${i + 1}</span>
            <span class="historial-text">${texto}</span>
        `;
        lista.appendChild(li);
    });
}


// ============================================================
// REINICIAR RULETA
// ============================================================
function reiniciarRuleta() {
    if (!confirm('¿Seguro que quieres reiniciar la caja y borrar el historial? 🔄')) return;

    // Preguntar también si se quieren resetear las llaves
    const resetLlaves = confirm('¿Resetear también los códigos de llave? (Si dices NO, los códigos ya usados seguirán sin funcionar) 🔑');

    historialRetos = [];
    retosUsados = [];
    borrarEstado(resetLlaves);

    if (resetLlaves) {
        llavesUsadas = [];
    }

    actualizarHistorial();
    actualizarRetosRestantes();

    // Limpiar la tira y resetear su posición
    const tira = document.getElementById('caja-tira');
    if (tira) {
        tira.innerHTML = '';
        tira.style.transform = 'translateX(0px)';
    }

    // Rehabilitar botón girar por si estaba deshabilitado
    const spinBtn = document.getElementById('spin-button');
    spinBtn.disabled = false;
    spinBtn.title = '';

    // Resetear también la caja visual
    resetCajaDisplay();
}


// ============================================================
// CUENTA ATRÁS HASTA LA BODA
// ============================================================
function actualizarCuentaAtras() {
    // Fecha de la boda: 13 de Junio de 2026
    const fechaBoda = new Date('2026-06-13T12:00:00');
    const ahora = new Date();
    const diferencia = fechaBoda - ahora;

    if (diferencia <= 0) {
        document.getElementById('countdown-days').textContent = '🎉';
        document.getElementById('countdown-hours').textContent = '¡YA!';
        document.getElementById('countdown-minutes').textContent = '🎉';
        document.getElementById('countdown-seconds').textContent = '🎉';
        return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    document.getElementById('countdown-days').textContent = String(dias).padStart(2, '0');
    document.getElementById('countdown-hours').textContent = String(horas).padStart(2, '0');
    document.getElementById('countdown-minutes').textContent = String(minutos).padStart(2, '0');
    document.getElementById('countdown-seconds').textContent = String(segundos).padStart(2, '0');
}


// ============================================================
// PARTÍCULAS DE FONDO
// ============================================================
function crearParticulas() {
    const container = document.getElementById('particles-container');
    const colores = ['#f59e0b', '#e11d48', '#22d3ee', '#a855f7', '#34d399', '#f472b6'];
    const numParticulas = 40;

    for (let i = 0; i < numParticulas; i++) {
        const particula = document.createElement('div');
        particula.className = 'particle';

        const tamano = Math.random() * 6 + 2;
        const color = colores[Math.floor(Math.random() * colores.length)];
        const left = Math.random() * 100;
        const duracion = Math.random() * 15 + 10;
        const delay = Math.random() * 15;
        const opacidad = Math.random() * 0.4 + 0.1;

        particula.style.cssText = `
            width: ${tamano}px;
            height: ${tamano}px;
            background: ${color};
            left: ${left}%;
            animation-duration: ${duracion}s;
            animation-delay: -${delay}s;
            opacity: ${opacidad};
            box-shadow: 0 0 ${tamano * 2}px ${color};
        `;

        container.appendChild(particula);
    }
}


// ============================================================
// CONFETTI 🎉
// ============================================================
function lanzarConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettis = [];
    const colores = ['#f59e0b', '#e11d48', '#22d3ee', '#a855f7', '#34d399', '#f472b6', '#ffffff'];
    const numConfetti = 150;

    for (let i = 0; i < numConfetti; i++) {
        confettis.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colores[Math.floor(Math.random() * colores.length)],
            velocidadY: Math.random() * 3 + 2,
            velocidadX: Math.random() * 4 - 2,
            rotacion: Math.random() * 360,
            rotacionVel: Math.random() * 10 - 5,
            opacidad: 1,
        });
    }

    let frame = 0;
    const maxFrames = 180; // ~3 segundos a 60fps

    function animarConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        confettis.forEach(c => {
            c.y += c.velocidadY;
            c.x += c.velocidadX;
            c.rotacion += c.rotacionVel;

            if (frame > maxFrames - 60) {
                c.opacidad -= 0.016;
            }

            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate((c.rotacion * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, c.opacidad);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            ctx.restore();
        });

        if (frame < maxFrames) {
            requestAnimationFrame(animarConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animarConfetti();
}


// ============================================================
// PREGUNTAS DEL QUIZ DE CULTURA GENERAL
// ============================================================
// 🎯 Edita aquí las preguntas, opciones y la respuesta correcta.
// "correcta" es el índice (0=A, 1=B, 2=C, 3=D) de la opción correcta.

const PREGUNTAS_QUIZ = [
    {
        pregunta: "¿Cuál es la capital de España?",
        opciones: ["Barcelona", "Madrid", "Sevilla", "Valencia"],
        correcta: 1
    },
    {
        pregunta: "¿Cuántas comunidades autónomas tiene España?",
        opciones: ["15", "16", "17", "19"],
        correcta: 2
    },
    {
        pregunta: "¿En qué año ganó España su primera Copa del Mundo de fútbol?",
        opciones: ["2006", "2008", "2010", "2012"],
        correcta: 2
    },
    {
        pregunta: "¿Cómo se llama el rey actual de España?",
        opciones: ["Juan Carlos I", "Carlos III", "Felipe VI", "Fernando VII"],
        correcta: 2
    },
    {
        pregunta: "¿Cuál es el río más largo que discurre íntegramente por territorio español?",
        opciones: ["Tajo", "Duero", "Guadalquivir", "Ebro"],
        correcta: 3
    }
];


// ============================================================
// QUIZ — VARIABLES Y LÓGICA
// ============================================================
let respuestasUsuario = [];
let quizResuelto = false;

function abrirQuiz() {
    quizResuelto = false;
    respuestasUsuario = new Array(PREGUNTAS_QUIZ.length).fill(null);
    renderizarQuiz();
    document.getElementById('quiz-container').classList.add('visible');
}

function cerrarQuiz() {
    document.getElementById('quiz-container').classList.remove('visible');
}

function renderizarQuiz() {
    const letras = ['A', 'B', 'C', 'D'];
    const container = document.getElementById('quiz-preguntas');
    const resultado = document.getElementById('quiz-resultado');
    container.innerHTML = '';
    resultado.innerHTML = '';
    resultado.classList.remove('visible');

    PREGUNTAS_QUIZ.forEach((q, qi) => {
        const div = document.createElement('div');
        div.className = 'quiz-pregunta';
        div.innerHTML = `
            <div class="quiz-pregunta-header">
                <span class="quiz-pregunta-numero">Pregunta ${qi + 1}</span>
                <span class="quiz-pregunta-icon">🇪🇸</span>
            </div>
            <p class="quiz-pregunta-texto">${q.pregunta}</p>
            <div class="quiz-opciones">
                ${q.opciones.map((op, oi) => `
                    <button class="quiz-opcion" data-q="${qi}" data-o="${oi}"
                            onclick="seleccionarOpcion(${qi}, ${oi})">
                        <span class="quiz-opcion-letra">${letras[oi]}</span>
                        <span class="quiz-opcion-texto">${op}</span>
                    </button>
                `).join('')}
            </div>
        `;
        container.appendChild(div);
    });

    // Botón comprobar
    const btnComprobar = document.createElement('button');
    btnComprobar.className = 'quiz-resultado-btn';
    btnComprobar.id = 'quiz-btn-comprobar';
    btnComprobar.style.cssText = 'margin-top:1.5rem;display:block;width:100%;font-size:1.05rem;';
    btnComprobar.textContent = '✅ Comprobar respuestas';
    btnComprobar.onclick = comprobarQuiz;
    container.appendChild(btnComprobar);

    // Botón cerrar
    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'quiz-resultado-btn';
    btnCerrar.style.cssText = 'margin-top:0.8rem;display:block;width:100%;background:rgba(255,255,255,0.08);color:#f8fafc;box-shadow:none;font-size:1rem;';
    btnCerrar.textContent = '✖ Cerrar quiz';
    btnCerrar.onclick = cerrarQuiz;
    container.appendChild(btnCerrar);
}

function seleccionarOpcion(qi, oi) {
    if (quizResuelto) return;
    respuestasUsuario[qi] = oi;
    const botones = document.querySelectorAll(`.quiz-opcion[data-q="${qi}"]`);
    botones.forEach(btn => btn.classList.remove('quiz-opcion-seleccionada'));
    document.querySelector(`.quiz-opcion[data-q="${qi}"][data-o="${oi}"]`).classList.add('quiz-opcion-seleccionada');
}

function comprobarQuiz() {
    if (respuestasUsuario.some(r => r === null)) {
        alert('¡Responde todas las preguntas primero! 😤');
        return;
    }
    quizResuelto = true;
    let aciertos = 0;

    PREGUNTAS_QUIZ.forEach((q, qi) => {
        const botones = document.querySelectorAll(`.quiz-opcion[data-q="${qi}"]`);
        botones.forEach(btn => btn.disabled = true);

        const usuario = respuestasUsuario[qi];
        const correcta = q.correcta;

        botones.forEach((btn, oi) => {
            btn.classList.remove('quiz-opcion-seleccionada');
            if (oi === correcta) {
                btn.classList.add('quiz-opcion-correcta');
            } else if (oi === usuario && usuario !== correcta) {
                btn.classList.add('quiz-opcion-incorrecta');
            } else {
                btn.classList.add('quiz-opcion-disabled');
            }
        });

        if (usuario === correcta) aciertos++;
    });

    // Ocultar botón comprobar
    document.getElementById('quiz-btn-comprobar').style.display = 'none';

    // Mostrar resultado
    let emoji, puntuacion, mensaje;
    if (aciertos === 5) {
        emoji = '🏆'; puntuacion = '5/5';
        mensaje = '¡PERFECTO! David sabe lo que se hace. ¡Increíble! 🎉';
    } else if (aciertos >= 3) {
        emoji = '😅'; puntuacion = `${aciertos}/5`;
        mensaje = 'Aprobado, pero raspando... Al menos no es un desastre total 😬';
    } else {
        emoji = '😂'; puntuacion = `${aciertos}/5`;
        mensaje = `¡SUSPENSO TOTAL! Solo ${aciertos}/5. ¡CHUPITO OBLIGATORIO! 🥃`;
        lanzarConfetti();
    }

    const resultado = document.getElementById('quiz-resultado');
    resultado.innerHTML = `
        <div class="quiz-resultado-card">
            <div class="quiz-resultado-emoji">${emoji}</div>
            <div class="quiz-resultado-puntuacion">${puntuacion}</div>
            <p class="quiz-resultado-mensaje">${mensaje}</p>
            <button class="quiz-resultado-btn" onclick="abrirQuiz()">🔄 Repetir Quiz</button>
            <button class="quiz-resultado-btn" style="margin-top:0.6rem;background:rgba(255,255,255,0.08);color:#f8fafc;box-shadow:none;" onclick="cerrarQuiz()">✖ Cerrar</button>
        </div>
    `;
    resultado.classList.add('visible');
}


// ============================================================
// SMOOTH SCROLL para el CTA
// ============================================================
document.getElementById('cta-start').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('ruleta-section').scrollIntoView({ behavior: 'smooth' });
});


// ============================================================
// CERRAR RESULTADO CON ESCAPE
// ============================================================
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        cerrarResultado();
    }
});


// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Cargar estado guardado desde localStorage
    cargarEstado();

    // Mostrar contador de retos restantes
    actualizarRetosRestantes();

    // Si había historial guardado, mostrarlo
    if (historialRetos.length > 0) {
        actualizarHistorial();

        // Si todos los retos ya estaban usados, deshabilitar el botón
        if (getRetosActivos().length === 0) {
            const spinBtn = document.getElementById('spin-button');
            spinBtn.disabled = true;
            spinBtn.title = '¡Todos los retos completados!';
        }
    }

    // Iniciar cuenta atrás
    actualizarCuentaAtras();
    setInterval(actualizarCuentaAtras, 1000);

    // Crear partículas de fondo
    crearParticulas();
});
