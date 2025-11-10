// patterns/facade/WorkerFacade.js - Patrón Facade (Oculta la complejidad de 3 Workers)
import { store } from '../../store/index.js';
import { setTasks, updateTaskFromSync } from '../../store/tasksSlice.js';
import { setUsers } from '../../store/usersSlice.js';
import { addLog } from '../../store/activityLogSlice.js';
import { setExportStatus } from '../../store/uiSlice.js';
import ActivityFactory from '../factory/ActivityFactory.js'; // Usa el Factory

class WorkerFacade {
constructor() {
        console.log("[Facade] Inicializando Workers con rutas corregidas.");
        
        // CORRECCIÓN: Rutas relativas a la raíz del proyecto (donde está index.html)
        this.prefetchWorker = new Worker('workers/prefetch.worker.js', { type: 'module' });
        this.syncWorker = new Worker('workers/sync.worker.js', { type: 'module' });
        this.exportWorker = new Worker('workers/export.worker.js', { type: 'module' });

        // Configura los Listeners
        this.prefetchWorker.onmessage = this._handlePrefetchComplete.bind(this);
        this.syncWorker.onmessage = this._handleSyncUpdate.bind(this); // Patrón Observer (Listener)
        this.exportWorker.onmessage = this._handleExportComplete.bind(this);
    }
    
    // --- 1. Worker 1 (Prefetch) ---
    startPrefetch(userId) {
        this.prefetchWorker.postMessage({ type: 'START', payload: userId });
    }
    
    // Maneja la respuesta del Worker 1
    _handlePrefetchComplete(event) {
        if (event.data.type === 'PREFETCH_COMPLETE') {
            const { tasks, users } = event.data.payload;
            // Despacha el payload gigante a los Slices correspondientes
            store.dispatch(setTasks(tasks));
            store.dispatch(setUsers(users));
            console.log('[Facade] Prefetch completado y datos despachados a Redux.');
        }
    }

    // --- 2. Worker 2 (Sync/Observer) ---
    startSync(userId) {
        this.syncWorker.postMessage({ type: 'START', payload: userId });
    }

    // Patrón Observer (Función Update/Reacción al Sujeto)
    _handleSyncUpdate(event) {
        const data = event.data;
        
        // El Observer reacciona a los cambios de otros usuarios
        if (data.type === 'COMMENT_ADDED') {
            // 1. Usa el Factory para crear el objeto de Log
            const activity = ActivityFactory.create(data.type, data.payload);
            // 2. Despacha el Log
            store.dispatch(addLog(activity));
            
            // Simular un cambio en la tarea misma
            store.dispatch(updateTaskFromSync({ taskId: data.payload.taskId, update: { lastActivity: new Date().toLocaleTimeString() } }));
        }
    }
    
    // --- 3. Worker 3 (Export/Strategy) ---
    startExport(data, format) {
        store.dispatch(setExportStatus(`Exportando a ${format}...`));
        this.exportWorker.postMessage({ type: 'EXPORT_DATA', payload: { data, format } });
    }

    _handleExportComplete(event) {
        if (event.data.type === 'EXPORT_COMPLETE') {
            store.dispatch(setExportStatus(`Exportación a ${event.data.format} completada.`));
            // Aquí se manejaría la descarga del archivo (Blob/URL.createObjectURL)
            console.log(`[Facade] Reporte en ${event.data.format} generado:`, event.data.result.substring(0, 50) + '...');
        } else if (event.data.type === 'EXPORT_ERROR') {
             store.dispatch(setExportStatus(`Error en exportación: ${event.data.message}`));
        }
    }
}

// Exporta la única instancia del Facade
export const workerFacade = new WorkerFacade();