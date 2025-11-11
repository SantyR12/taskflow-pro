// 🔄 FUNCIÓN: Simula la actividad de otros usuarios en tiempo real.
// 📢 UTILIZA: El Patrón Observer (es el Sujeto) para notificar al hilo principal periódicamente.
self.onmessage = (event) => {
    // Escucha mensajes del hilo principal (enviados por el WorkerFacade).
    if (event.data.type !== 'START') return; // Espera el comando de inicio después del login.

    console.log('[Worker 2] Sync Worker iniciado (Observer Subject).');
    
    // setInterval: Función recurrente que se ejecuta en el background.
    // Esto demuestra que el Worker puede realizar tareas de larga duración o periódicas sin congelar la UI.
    setInterval(() => {
        const randomTaskId = Math.floor(Math.random() * 10) + 1; // Genera datos de simulación.
        const randomUser = Math.random() < 0.5 ? 'John Doe' : 'Jane Smith';
        
        // postMessage: La forma en que el Worker notifica (Observa) al hilo principal.
        self.postMessage({ 
            type: 'COMMENT_ADDED', // Tipo de evento que recibirá el Facade.
            payload: { taskId: randomTaskId, user: randomUser }
        });
    }, 6000); // Frecuencia de la notificación (6 segundos).
};

//(observer)