import { store } from './store/index.js'; // es el objeto redux que es el almacen central de la app
import { workerFacade } from './patterns/facade/WorkerFacade.js'; // Patrón Facade: Interfaz simplificada para interactuar con los Web Workers.
import { loginSuccess } from './store/authSlice.js'; // Acción Redux: (Aunque no se usa directamente aquí, se mantiene por contexto si se implementara auto-login).
import { renderLogin } from './ui/Login.js'; // Función UI: Para dibujar el formulario de inicio de sesión.
import { renderBoard } from './ui/Board.js'; // Función UI: Para dibujar el tablero Kanban.

// Referencias a los contenedores HTML.
const boardContainer = document.getElementById('board-container');
const loginContainer = document.getElementById('login-container');
const exportBtn = document.getElementById('export-btn'); // Botón para iniciar la exportación.


/**
 * Crea un Blob a partir del contenido y fuerza la descarga en el navegador.
 * @param {string} content - Contenido del archivo (ej. string CSV o JSON).
 * @param {string} format - 'CSV' o 'JSON'.
 */
const downloadFile = (content, format) => {
    // Determina el tipo MIME y la extensión según el formato.
    const mimeType = format === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const extension = format === 'CSV' ? 'csv' : 'json';
    
    // Crea el Blob (objeto binario) a partir del string de contenido.
    const blob = new Blob([content], { type: mimeType });
    // Crea una URL local temporal que apunta al Blob.
    const url = URL.createObjectURL(blob);
    
    // Crea un elemento <a> invisible para forzar la descarga.
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Genera un nombre de archivo dinámico con la fecha de hoy.
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `reporte_taskflow_${date}.${extension}`);
    
    // Simula el clic para iniciar la descarga.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libera la URL temporal de la memoria del navegador.
    URL.revokeObjectURL(url);
};


// Sincroniza el estado de Redux con la Interfaz de Usuario.
const renderApp = () => {
    const state = store.getState(); // Obtiene el estado actual.
    const { isAuthenticated, user } = state.auth; // Desestructura la información de autenticación.

    // Lógica de Navegación 
    if (isAuthenticated) {
        // Si está autenticado, muestra el tablero y el botón de exportar.
        loginContainer.classList.add('hidden');
        boardContainer.classList.remove('hidden');
        exportBtn.classList.remove('hidden');
        
        renderBoard(state); // Dibuja el tablero Kanban.
    } else {
        // Si no está autenticado, muestra el formulario de login y oculta el tablero.
        loginContainer.classList.remove('hidden');
        boardContainer.classList.add('hidden');
        exportBtn.classList.add('hidden');
        renderLogin(); // Dibuja el formulario de login.
    }

    // Renderizado del Log de Actividad 
    const logList = document.getElementById('log-list');
    // Mapea los items del log a elementos <li> y los une en un solo string HTML.
    logList.innerHTML = state.activityLog.log
        .map(item => `<li>[${item.type}] ${item.message}</li>`)
        .join('');

    // Renderizado del Estado de Exportación 
    document.getElementById('export-status-message').textContent = 
        `Estado de Exportación: ${state.ui.exportStatus}`;
};


let hasLoadedBoard = false; // Bandera para asegurar que la lógica de inicialización solo corra una vez.
// Esta función se ejecuta CADA VEZ que el estado cambia.
store.subscribe(() => {
    const state = store.getState();
    const { user } = state.auth;
    
    // Lógica de Inicialización después del PRIMER Login.
    if (user && !hasLoadedBoard) {
        console.log(`[Main] Usuario logueado. Iniciando Prefetch Worker (Flujo de Promesas)...`);
        workerFacade.startPrefetch(user.id); // Inicia la precarga de datos en segundo plano.
        workerFacade.startSync(user.id); // Inicia la sincronización periódica de datos.
        hasLoadedBoard = true; // Marca como cargado para evitar que se ejecute de nuevo.
    }
    
    renderApp(); // Vuelve a dibujar la aplicación para reflejar el nuevo estado.
});

// Escucha las respuestas de los Web Workers.
workerFacade.subscribe((event) => {
    
    // Usa switch para manejar diferentes tipos de eventos que vienen del Worker.
    switch (event.type) {

        case 'EXPORT_COMPLETE': // El Worker terminó de generar el archivo.
            document.getElementById('export-status-message').textContent = 'Estado de Exportación: Completo';
            downloadFile(event.result, event.format); // Llama a la función para forzar la descarga.
            break;

        case 'EXPORT_ERROR': // El Worker reportó un error durante la exportación.
            document.getElementById('export-status-message').textContent = `Estado de Exportación: Error - ${event.message}`;
            alert(`Error en la exportación: ${event.message}`);
            break;
            
    }
    renderApp(); // Vuelve a renderizar la aplicación (para actualizar mensajes de estado).
});

// Event listener del botón de Exportar.
exportBtn.addEventListener('click', () => {
    const state = store.getState(); // Obtiene el estado actual.
    // Obtiene las partes necesarias del estado para la exportación.
    const tasks = state.tasks.tasks;
    const columns = state.board.columns;
    const users = state.users.users; 

    const preparedData = []; // Array donde se almacenarán los datos listos para exportar.
    
    // Lógica para combinar datos de Tarea, Columna y Usuario
    // Recorre las columnas en el orden correcto.
    state.board.columnOrder.forEach(colId => {
        const column = columns[colId];
        
        // Recorre los IDs de las tareas dentro de esa columna.
        column.taskIds.forEach(taskId => {
            const task = tasks[taskId];
            if (!task) return; // Ignora si la tarea no se encuentra 

            // Combina los datos de la tarea con información de la columna y el usuario asignado.
            preparedData.push({
                ...task, // Copia todas las propiedades de la tarea.
                columnName: column.title, // Añade el nombre de la columna.
                assignedUser: users[task.userId] ? users[task.userId].name : 'Sin Asignar' // Añade el nombre del usuario.
            });
        });
    });

    // Inicio del Proceso de Exportación 
    if (preparedData.length > 0) {
        console.log("[Main] Iniciando exportación de tareas a CSV a través del Worker...");
        document.getElementById('export-status-message').textContent = 'Estado de Exportación: Procesando...';
        // Envía los datos enriquecidos y el formato deseado al Worker para su procesamiento en segundo plano.
        workerFacade.startExport(preparedData, 'CSV'); 
    } else {
        alert("No hay tareas para exportar.");
    }
});

renderApp(); // **Primera y única llamada inicial** al renderizar la aplicación por primera vez.