self.onmessage = (event) => {
    if (event.data.type !== 'START') return;

    console.log('[Worker 2] Sync Worker iniciado (Observer Subject).');
    
    setInterval(() => {
        const randomTaskId = Math.floor(Math.random() * 10) + 1;
        const randomUser = Math.random() < 0.5 ? 'John Doe' : 'Jane Smith';
        
        self.postMessage({ 
            type: 'COMMENT_ADDED', 
            payload: { taskId: randomTaskId, user: randomUser }
        });
    }, 6000); 
};