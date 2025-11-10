// main.js - Punto de Entrada y Suscriptor Redux
import { store } from './store/index.js';
import { workerFacade } from './patterns/facade/WorkerFacade.js';
import { loginSuccess } from './store/authSlice.js';
import { renderLogin } from './ui/Login.js';
import { renderBoard } from './ui/Board.js';

// --- Estado de la UI ---
const boardContainer = document.getElementById('board-container');
const loginContainer = document.getElementById('login-container');
const exportBtn = document.getElementById('export-btn');

// ---------------------------------------------------
// 🟢 FUNCIÓN DE DESCARGA (Se ejecuta en el Hilo Principal)
// ---------------------------------------------------

/**
 * Crea un Blob a partir del contenido y fuerza la descarga en el navegador.
 * @param {string} content - Contenido del archivo (ej. string CSV o JSON).
 * @param {string} format - 'CSV' o 'JSON'.
 */
const downloadFile = (content, format) => {
    const mimeType = format === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const extension = format === 'CSV' ? 'csv' : 'json';
    
    // Crear el Blob
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Nombre del archivo con fecha actual
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `reporte_taskflow_${date}.${extension}`);
    
    // Simular clic para iniciar la descarga
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar la URL del objeto
    URL.revokeObjectURL(url);
};

// ---------------------------------------------------
// --- Función de Renderizado (Simplificada) ---
// ---------------------------------------------------

const renderApp = () => {
    const state = store.getState();
    const { isAuthenticated, user } = state.auth;

    if (isAuthenticated) {
        loginContainer.classList.add('hidden');
        boardContainer.classList.remove('hidden');
        exportBtn.classList.remove('hidden');
        
        // Simulación de renderizado del tablero (Drag and Drop)
        renderBoard(state); 
    } else {
        loginContainer.classList.remove('hidden');
        boardContainer.classList.add('hidden');
        exportBtn.classList.add('hidden');
        renderLogin(); // Inicializa el listener del formulario
    }

    // Renderizar Log de Actividad
    const logList = document.getElementById('log-list');
    logList.innerHTML = state.activityLog.log
        .map(item => `<li>[${item.type}] ${item.message}</li>`)
        .join('');

    // Actualizar estado de Exportación
    document.getElementById('export-status-message').textContent = 
        `Estado de Exportación: ${state.ui.exportStatus}`;
};

// ---------------------------------------------------
// --- Suscripción a Redux y Manejo de Workers ---
// ---------------------------------------------------

let hasLoadedBoard = false;
store.subscribe(() => {
    const state = store.getState();
    const { user } = state.auth;
    
    // Disparar Worker 1 (Prefetch) después del login
    if (user && !hasLoadedBoard) {
        console.log(`[Main] Usuario logueado. Iniciando Prefetch Worker (Flujo de Promesas)...`);
        workerFacade.startPrefetch(user.id); 
        workerFacade.startSync(user.id); // Disparar Worker 2 (Observer Subject)
        hasLoadedBoard = true;
    }
    
    renderApp();
});


// 🟢 Manejo de la Respuesta del Facade
workerFacade.subscribe((event) => {
    // Aquí puedes despachar acciones de Redux para actualizar el estado UI
    // Por ejemplo: store.dispatch(updateUIStatus(event.type));
    
    switch (event.type) {
        // ... (otros casos)

        case 'EXPORT_COMPLETE':
            document.getElementById('export-status-message').textContent = 'Estado de Exportación: Completo';
            // 🛑 Llama a la función de descarga con el resultado del Worker
            downloadFile(event.result, event.format); 
            break;

        case 'EXPORT_ERROR':
            document.getElementById('export-status-message').textContent = `Estado de Exportación: Error - ${event.message}`;
            alert(`Error en la exportación: ${event.message}`);
            break;
            
        // ... (otros casos)
    }
    renderApp();
});


// --- Manejo del Export Button (Worker 3 - Strategy) ---
exportBtn.addEventListener('click', () => {
    const state = store.getState();
    const tasks = state.tasks.tasks;
    const columns = state.board.columns;
    const users = state.users.users; // Asumimos un slice 'users'

    // 1. Preparar y enriquecer los datos de las tareas
    const preparedData = [];
    
    // Iteramos sobre las columnas para obtener el nombre de la columna para cada tarea
    state.board.columnOrder.forEach(colId => {
        const column = columns[colId];
        
        column.taskIds.forEach(taskId => {
            const task = tasks[taskId];
            if (!task) return;

            // Enriquecer el objeto de tarea con datos de UI (Columna y Usuario)
            preparedData.push({
                ...task,
                columnName: column.title,
                assignedUser: users[task.userId] ? users[task.userId].name : 'Sin Asignar'
            });
        });
    });

    // 2. Envía los datos enriquecidos y la estrategia 'CSV' al Facade
    if (preparedData.length > 0) {
        console.log("[Main] Iniciando exportación de tareas a CSV a través del Worker...");
        document.getElementById('export-status-message').textContent = 'Estado de Exportación: Procesando...';
        workerFacade.startExport(preparedData, 'CSV'); 
    } else {
        alert("No hay tareas para exportar.");
    }
});

// Inicializar la aplicación
renderApp();