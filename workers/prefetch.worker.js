self.onmessage = async (event) => { // El worker escucha mensajes del hilo principal
    // Verifica que el mensaje sea del tipo START
    if (event.data.type !== 'START') return;
    
    // Desestructura el userId del payload
    const userId = event.data.payload;
    // Define la URL base para las solicitudes API
    const baseURL = 'https://jsonplaceholder.typicode.com';

    try {
        // Peticion asincrona para obtener la respuesta HTTP 
        const todosResponse = await fetch(`${baseURL}/users/${userId}/todos`);
        // Procesa la respuesta como JSON
        const todos = await todosResponse.json();
        
        console.log(`[Worker 1] Fetched ${todos.length} tasks.`);

        // Prepara una lista de IDs de usuarios únicos asociados a las tareas
        // .mpa trae solo el ID
        // .slice(0, 5) limita a los primeros 5 IDs para optimizar la carga
        // ...new Set() elimina IDs duplicados
        // [... ] convierte el Set de nuevo a un array
        const uniqueUserIds = [...new Set(todos.map(t => t.userId).slice(0, 5))];

        console.log(`[Worker 1] Fetching ${uniqueUserIds.length} users in parallel...`);
        // Crea un array de promesas para obtener los datos de cada usuario
        const userPromises = uniqueUserIds.map(id => 
            // Inicia la peticion y retorna la promesa
            fetch(`${baseURL}/users/${id}`).then(res => res.json())
        );
        // Espera a que todas las promesas de usuarios se resuelvan
        const rawUsers = await Promise.all(userPromises);

        // Esto permite un acceso rapido a las tareas y usuarios por ID
        const tasks = todos.reduce((acc, task) => ({ ...acc, [task.id]: task }), {});
        // Convierte el array de usuarios en un objeto usando el ID como clave
        const users = rawUsers.reduce((acc, user) => ({ ...acc, [user.id]: user }), {});
        // Envia el mensaje de exito con los datos normalizados 
        self.postMessage({ 
            type: 'PREFETCH_COMPLETE', 
            payload: { tasks, users } 
        });

    } catch (error) {
        // Captura y registra cualquier error ocurrido durante el proceso
        console.error('[Worker 1] Error en flujo de promesas:', error);
    }
};