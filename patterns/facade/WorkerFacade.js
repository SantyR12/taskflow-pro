const subscribers = [];

const prefetchWorker = new Worker('../workers/prefetch.worker.js', { type: 'module' });
const syncWorker = new Worker('../workers/sync.worker.js', { type: 'module' });
const exportWorker = new Worker('../workers/export.worker.js', { type: 'module' });

const notifySubscribers = (eventData) => {
    subscribers.forEach(callback => {
        callback(eventData);
    });
};

prefetchWorker.onmessage = (event) => notifySubscribers(event.data);
syncWorker.onmessage = (event) => notifySubscribers(event.data);
exportWorker.onmessage = (event) => notifySubscribers(event.data);
prefetchWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Prefetch', message: error.message });
syncWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Sync', message: error.message });
exportWorker.onerror = (error) => notifySubscribers({ type: 'WORKER_ERROR', worker: 'Export', message: error.message });


export const workerFacade = {
    startPrefetch: (userId) => {
        prefetchWorker.postMessage({ type: 'PREFETCH_DATA', payload: { userId } });
    },
    
    startSync: (userId) => {
        syncWorker.postMessage({ type: 'START_SYNC', payload: { userId } });
    },

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
    unsubscribe: (callback) => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    }
};