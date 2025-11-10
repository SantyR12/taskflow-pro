import { store } from './store/index.js';
import { workerFacade } from './patterns/facade/WorkerFacade.js';
import { loginSuccess } from './store/authSlice.js';
import { renderLogin } from './ui/Login.js';
import { renderBoard } from './ui/Board.js';

const boardContainer = document.getElementById('board-container');
const loginContainer = document.getElementById('login-container');
const exportBtn = document.getElementById('export-btn');


/**
 * Crea un Blob a partir del contenido y fuerza la descarga en el navegador.
 * @param {string} content - Contenido del archivo (ej. string CSV o JSON).
 * @param {string} format - 'CSV' o 'JSON'.
 */
const downloadFile = (content, format) => {
    const mimeType = format === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const extension = format === 'CSV' ? 'csv' : 'json';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `reporte_taskflow_${date}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};


const renderApp = () => {
    const state = store.getState();
    const { isAuthenticated, user } = state.auth;

    if (isAuthenticated) {
        loginContainer.classList.add('hidden');
        boardContainer.classList.remove('hidden');
        exportBtn.classList.remove('hidden');
        
        renderBoard(state); 
    } else {
        loginContainer.classList.remove('hidden');
        boardContainer.classList.add('hidden');
        exportBtn.classList.add('hidden');
        renderLogin(); 
    }

    const logList = document.getElementById('log-list');
    logList.innerHTML = state.activityLog.log
        .map(item => `<li>[${item.type}] ${item.message}</li>`)
        .join('');

    document.getElementById('export-status-message').textContent = 
        `Estado de Exportación: ${state.ui.exportStatus}`;
};


let hasLoadedBoard = false;
store.subscribe(() => {
    const state = store.getState();
    const { user } = state.auth;
    
    if (user && !hasLoadedBoard) {
        console.log(`[Main] Usuario logueado. Iniciando Prefetch Worker (Flujo de Promesas)...`);
        workerFacade.startPrefetch(user.id); 
        workerFacade.startSync(user.id); 
        hasLoadedBoard = true;
    }
    
    renderApp();
});

workerFacade.subscribe((event) => {
    
    switch (event.type) {

        case 'EXPORT_COMPLETE':
            document.getElementById('export-status-message').textContent = 'Estado de Exportación: Completo';
            downloadFile(event.result, event.format); 
            break;

        case 'EXPORT_ERROR':
            document.getElementById('export-status-message').textContent = `Estado de Exportación: Error - ${event.message}`;
            alert(`Error en la exportación: ${event.message}`);
            break;
            
    }
    renderApp();
});

exportBtn.addEventListener('click', () => {
    const state = store.getState();
    const tasks = state.tasks.tasks;
    const columns = state.board.columns;
    const users = state.users.users; 

    const preparedData = [];
    
    state.board.columnOrder.forEach(colId => {
        const column = columns[colId];
        
        column.taskIds.forEach(taskId => {
            const task = tasks[taskId];
            if (!task) return;

            preparedData.push({
                ...task,
                columnName: column.title,
                assignedUser: users[task.userId] ? users[task.userId].name : 'Sin Asignar'
            });
        });
    });

    if (preparedData.length > 0) {
        console.log("[Main] Iniciando exportación de tareas a CSV a través del Worker...");
        document.getElementById('export-status-message').textContent = 'Estado de Exportación: Procesando...';
        workerFacade.startExport(preparedData, 'CSV'); 
    } else {
        alert("No hay tareas para exportar.");
    }
});

renderApp();