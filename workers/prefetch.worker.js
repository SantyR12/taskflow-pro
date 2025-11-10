// workers/prefetch.worker.js - Worker 1 (Carga pesada en segundo plano)
self.onmessage = async (event) => {
    if (event.data.type !== 'START') return;
    
    const userId = event.data.payload;
    const baseURL = 'https://jsonplaceholder.typicode.com';

    try {
        // --- Fetch 1: Obtener tareas del usuario ---
        const todosResponse = await fetch(`${baseURL}/users/${userId}/todos`);
        const todos = await todosResponse.json();
        
        console.log(`[Worker 1] Fetched ${todos.length} tasks.`);

        // --- Then 1: Recolectar userIds únicos de 'asignados' (simulados) ---
        // Usamos los primeros 5 usuarios de JSONPlaceholder como 'asignados' simulados
        const uniqueUserIds = [...new Set(todos.map(t => t.userId).slice(0, 5))];

        // --- Fetch 2: Promise.all para obtener usuarios en paralelo ---
        console.log(`[Worker 1] Fetching ${uniqueUserIds.length} users in parallel...`);
        const userPromises = uniqueUserIds.map(id => 
            fetch(`${baseURL}/users/${id}`).then(res => res.json())
        );
        const rawUsers = await Promise.all(userPromises);

        // --- Then 2: Normalizar y Preparar Payload ---
        const tasks = todos.reduce((acc, task) => ({ ...acc, [task.id]: task }), {});
        const users = rawUsers.reduce((acc, user) => ({ ...acc, [user.id]: user }), {});

        // --- PostMessage con payload completo ---
        self.postMessage({ 
            type: 'PREFETCH_COMPLETE', 
            payload: { tasks, users } 
        });

    } catch (error) {
        console.error('[Worker 1] Error en flujo de promesas:', error);
    }
};