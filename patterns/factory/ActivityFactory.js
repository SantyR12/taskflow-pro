//Implementa un patrón de diseño "Factory" (Fábrica).
//El objetivo es centralizar y estandarizar la creación de objetos de
//registro de actividad (logs) para toda la aplicación.

const ActivityFactory = {
    //Método principal de la fábrica para crear un nuevo objeto de log.
    create: (type, payload) => {

        //'baseLog' define la estructura común que todos los registros de actividad deben compartir.
        const baseLog = { 
            id: Date.now() + Math.random(), // ID único para el log (uso temporal, idealmente vendría de un UUID).
            timestamp: new Date().toLocaleTimeString(), // Marca de tiempo de cuándo ocurrió el evento.
            type // El tipo de evento que se está registrando. 
        };

        // Usamos un 'switch' para determinar el mensaje específico legible 
        // basado en el 'type' de la actividad.
        switch (type) {
            case 'TASK_CREATED':
                // Fusionamos el 'baseLog' con el mensaje específico usando 'spread operator'
                return { ...baseLog, message: `[${payload.user}] creó la tarea: "${payload.title}"` };
            case 'COMMENT_ADDED':
                return { ...baseLog, message: `[${payload.user}] añadió un comentario a Tarea #${payload.taskId}.` };
            case 'TASK_MOVED':
                return { ...baseLog, message: `[${payload.user}] movió la Tarea #${payload.taskId} a la columna: ${payload.columnTitle}.` };
            default:
                // Un 'default' para manejar tipos desconocidos. Ayuda a depurar si 
                // se envía un tipo de actividad que no hemos definido.
                console.error('Tipo de actividad desconocido:', type);
                return { ...baseLog, message: `Evento desconocido: ${type}` };
        }
    }
};

// Exportamos la fábrica para que otros módulos (ej. los reducers de Redux o middlewares) 
// puedan importarla y usarla.
export default ActivityFactory;
