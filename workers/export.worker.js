// workers/export.worker.js - Worker 3 (Reportes pesados sin congelar UI)
// Implementa el Patrón Strategy

// Las estrategias de exportación (Patrón Strategy)
const ExportStrategies = {
    // Estrategia 1: CSV
    CSV: (data) => { 
        if (!data || data.length === 0) return 'ID,Title,Completed\n';
        const headers = ['id', 'title', 'completed', 'userId'].join(',');
        const rows = data.map(item => 
            [item.id, `"${item.title.replace(/"/g, '""')}"`, item.completed, item.userId].join(',')
        ).join('\n');
        return headers + '\n' + rows;
    },
    // Estrategia 2: JSON
    JSON: (data) => { 
        // Genera un string JSON formateado y legible
        return JSON.stringify({ reportDate: new Date().toISOString(), data: data }, null, 2);
    }
};

self.onmessage = (event) => {
    if (event.data.type !== 'EXPORT_DATA') return;
    
    const { format, data } = event.data.payload;
    
    // Selecciona la estrategia en tiempo de ejecución
    const strategy = ExportStrategies[format];

    if (strategy) {
        try {
            // Ejecuta la estrategia
            const result = strategy(data);
            
            // Envía el resultado de vuelta al Facade
            self.postMessage({ type: 'EXPORT_COMPLETE', result, format });
        } catch (error) {
            self.postMessage({ type: 'EXPORT_ERROR', message: `Error al generar ${format}: ${error.message}` });
        }
    } else {
        self.postMessage({ type: 'EXPORT_ERROR', message: `Formato de exportación no soportado: ${format}` });
    }
};