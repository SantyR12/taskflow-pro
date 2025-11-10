// workers/sync.worker.js - Worker 2 (Simula otros usuarios/eventos externos)
self.onmessage = (event) => {
    if (event.data.type !== 'START') return;

    console.log('[Worker 2] Sync Worker iniciado (Observer Subject).');
    
    // Simula la actividad de otros usuarios (Patrón Observer - Sujeto)
    setInterval(() => {
        const randomTaskId = Math.floor(Math.random() * 10) + 1;
        const randomUser = Math.random() < 0.5 ? 'John Doe' : 'Jane Smith';
        
        // El Sujeto genera el evento y llama a postMessage (Notificación)
        self.postMessage({ 
            type: 'COMMENT_ADDED', 
            payload: { taskId: randomTaskId, user: randomUser }
        });
    }, 6000); // Notifica al Main Thread cada 6 segundos
};