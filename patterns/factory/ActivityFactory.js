const ActivityFactory = {
    create: (type, payload) => {
        const baseLog = { 
            id: Date.now() + Math.random(), 
            timestamp: new Date().toLocaleTimeString(), 
            type 
        };
        
        switch (type) {
            case 'TASK_CREATED':
                return { ...baseLog, message: `[${payload.user}] creó la tarea: "${payload.title}"` };
            case 'COMMENT_ADDED':
                return { ...baseLog, message: `[${payload.user}] añadió un comentario a Tarea #${payload.taskId}.` };
            case 'TASK_MOVED':
                return { ...baseLog, message: `[${payload.user}] movió la Tarea #${payload.taskId} a la columna: ${payload.columnTitle}.` };
            default:
                console.error('Tipo de actividad desconocido:', type);
                return { ...baseLog, message: `Evento desconocido: ${type}` };
        }
    }
};

export default ActivityFactory;