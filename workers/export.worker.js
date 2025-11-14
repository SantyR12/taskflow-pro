const ExportStrategies = { // Contiene cada estrategia de exportación.

    // Estrategia para generar contendido CSV
    CSV: (data) => { 
        // Manejo de caso vacío
        if (!data || data.length === 0) return 'ID,Título,Columna,Usuario Asignado,Última Actividad\n';
        // Generacion de la cabecera CSV
        const headers = ['ID', 'Título', 'Columna', 'Usuario Asignado', 'Última Actividad'].join(',');
        
        // Mappeo de los datos a formato CSV
        const rows = data.map(item => {
            // Logica de escape CSV para el titulo
            // Reemplaza comillas dobles por comillas dobles dobles y encierra el titulo entre comillas
            // Esto previene errores en el formato CSV si el titulo contiene comas o comillas
            const cleanTitle = `"${item.title.replace(/"/g, '""')}"`;
            // Manejo de caso nulo para la ultima actividad
            const cleanActivity = item.lastActivity || 'N/A';
            
            // Retorna un array con los campos en orden y los une con comas
            return [
                item.id, 
                cleanTitle, 
                item.columnName, 
                item.assignedUser, 
                cleanActivity
            ].join(',');
            // Une cada fila con un salto de linea
        }).join('\n');
        
        // Combina cabecera y filas
        return headers + '\n' + rows;
    },

    // Estrategia para generar contenido JSON
    JSON: (data) => {
        // Convierte el objeto de datos a una cadena JSON
        // Incluye la fecha de reporte de metadatos
        // Usa una indentacion de 2 espacios para mejor legibilidad 
        return JSON.stringify({ reportDate: new Date().toISOString(), data: data }, null, 2);
    }
};

// El worker escucha mensajes enviados desde el hilo principal
self.onmessage = (event) => {
    // Solo procesa mensajes del tipo EXPORT_DATA
    if (event.data.type !== 'EXPORT_DATA') return;
    
    // Desestructura el formato y los datos del mensaje
    const { format, data } = event.data.payload;
    
    // Selecciona la estrategia de exportación basada en el formato solicitado
    const strategy = ExportStrategies[format];

    // Verifica si la estrategia existe
    if (strategy) {
        try {
            // Ejecuta la estrategia para generar el contenido exportado
            const result = strategy(data);
            
            // Envía el resultado de vuelta al hilo principal
            self.postMessage({ type: 'EXPORT_COMPLETE', result, format });
        } catch (error) {
            // Manejo de errores durante la generación del contenido
            self.postMessage({ type: 'EXPORT_ERROR', message: `Error al generar ${format}: ${error.message}` });
        }
    } else {
        // Manejo de caso donde el formato no esta definido
        self.postMessage({ type: 'EXPORT_ERROR', message: `Formato de exportación no soportado: ${format}` });
    }
};