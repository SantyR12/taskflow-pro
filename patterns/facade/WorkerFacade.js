// patterns/facade/WorkerFacade.js

// 1. Almacenamiento de los suscriptores (Callbacks del hilo principal)
const subscribers = [];

// 2. Inicialización de los Workers
// NOTA: Ajusta la ruta si es necesario. Se asume que estás en patterns/facade/
const prefetchWorker = new Worker('../workers/prefetch.worker.js', { type: 'module' });
const syncWorker = new Worker('../workers/sync.worker.js', { type: 'module' });
const exportWorker = new Worker('../workers/export.worker.js', { type: 'module' });

// 3. Función central para notificar a todos los suscriptores
const notifySubscribers = (eventData) => {
    subscribers.forEach(callback => {
        // Ejecuta cada función suscrita con los datos recibidos del Worker
        callback(eventData);
    });
};

// 4. Conexión de los eventos onmessage de cada Worker al notificador central
prefetchWorker.onmessage = (event) => notifySubscribers(event.data);
syncWorker.onmessage = (event) => notifySubscribers(event.data);
exportWorker.onmessage = (event) => notifySubscribers(event.data);
// Opcional: Manejar errores en los Workers
prefetchWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Prefetch', message: error.message });
syncWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Sync', message: error.message });
exportWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Export', message: error.message });


// 5. El Objeto Facade exportado
export const workerFacade = {
    // Métodos para iniciar tareas en Workers
    startPrefetch: (userId) => {
        prefetchWorker.postMessage({ type: 'PREFETCH_DATA', payload: { userId } });
    },
    
    startSync: (userId) => {
        syncWorker.postMessage({ type: 'START_SYNC', payload: { userId } });
    },

    startExport: (data, format) => {
        exportWorker.postMessage({ type: 'EXPORT_DATA', payload: { data, format } });
    },

    // 🟢 Método subscribe (El que faltaba)
    /**
     * Permite que el hilo principal se suscriba para recibir mensajes de los Workers.
     * @param {function} callback - La función a ejecutar cuando un Worker envía un mensaje.
     */
    subscribe: (callback) => {
        if (typeof callback === 'function') {
            subscribers.push(callback);
        }
    },

    // Método opcional para limpiar un listener
    unsubscribe: (callback) => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    }
};