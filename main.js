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

// --- Función de Renderizado (Simplificada) ---
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

// --- Suscripción a Redux (Dispara el renderizado) ---
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

// --- Manejo del Export Button (Worker 3 - Strategy) ---
exportBtn.addEventListener('click', () => {
    const tasks = store.getState().tasks.tasks;
    // Envía los datos y la estrategia ('JSON' o 'CSV') al Facade
    workerFacade.startExport(Object.values(tasks), 'JSON'); 
});

// Inicializar la aplicación
renderApp();