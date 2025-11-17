//Implementa un patrón "Facade" (Fachada) para gestionar Web Workers. El objetivo es ocultar la complejidad de manejar múltiples workers (prefetch, sync, export) detrás de una API simple y unificada.
//El objetivo es ocultar la complejidad de manejar múltiples workers (prefetch, sync, export)
//detrás de una API simple y unificada.
//También implementa un patrón "Pub/Sub" (Publicador/Suscriptor) para la comunicación.

// Este array 'subscribers' almacena todos los 'callbacks' que se han suscrito
// para recibir mensajes o errores de CUALQUIER worker.
const subscribers = [];

// Creamos instancias de nuestros tres workers. Cada uno corre en un hilo separado
// para no bloquear el hilo principal (UI) con tareas pesadas.
const prefetchWorker = new Worker('../workers/prefetch.worker.js', { type: 'module' });
const syncWorker = new Worker('../workers/sync.worker.js', { type: 'module' });
const exportWorker = new Worker('../workers/export.worker.js', { type: 'module' });

const notifySubscribers = (eventData) => {
    subscribers.forEach(callback => {
        callback(eventData);
    });
};

// Conectamos el evento 'onmessage' de CADA worker a 'notifySubscribers'.
// Esto unifica todos los mensajes entrantes en un solo flujo.
prefetchWorker.onmessage = (event) => notifySubscribers(event.data);
syncWorker.onmessage = (event) => notifySubscribers(event.data);
exportWorker.onmessage = (event) => notifySubscribers(event.data);

// Hacemos lo mismo para 'onerror'. Centralizamos el manejo de errores.
// Si cualquier worker falla, lo notificamos con un formato estandarizado.
prefetchWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Prefetch', message: error.message });
syncWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Sync', message: error.message });
exportWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Export', message: error.message });


export const workerFacade = {
    // Inicia la tarea de 'prefetching' (precarga de datos).
    startPrefetch: (userId) => {
        prefetchWorker.postMessage({ type: 'PREFETCH_DATA', payload: { userId } });
    },

    // Inicia la tarea de sincronización (ej. enviar estado local al backend).
    startSync: (userId) => {
        syncWorker.postMessage({ type: 'START_SYNC', payload: { userId } });
    },

    // Inicia la tarea de exportación de datos.
    startExport: (data, format) => {
        exportWorker.postMessage({ type: 'EXPORT_DATA', payload: { data, format } });
    },

    /**
     * Permite que el hilo principal se suscriba para recibir mensajes de los Workers.
     * @param {function} callback - La función a ejecutar cuando un Worker envía un mensaje.
     */
    subscribe: (callback) => {
        if (typeof callback === 'function') {
            subscribers.push(callback);
        }
    },

    // Método 'unsubscribe' para dejar de escuchar.
    unsubscribe: (callback) => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    }
};
