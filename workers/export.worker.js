const ExportStrategies = {

    CSV: (data) => { 
        if (!data || data.length === 0) return 'ID,Título,Columna,Usuario Asignado,Última Actividad\n';
        
        const headers = ['ID', 'Título', 'Columna', 'Usuario Asignado', 'Última Actividad'].join(',');
        
        const rows = data.map(item => {
            const cleanTitle = `"${item.title.replace(/"/g, '""')}"`;
            const cleanActivity = item.lastActivity || 'N/A';
            
            return [
                item.id, 
                cleanTitle, 
                item.columnName, 
                item.assignedUser, 
                cleanActivity
            ].join(',');
        }).join('\n');
        
        return headers + '\n' + rows;
    },
    JSON: (data) => { 
        return JSON.stringify({ reportDate: new Date().toISOString(), data: data }, null, 2);
    }
};

self.onmessage = (event) => {
    if (event.data.type !== 'EXPORT_DATA') return;
    
    const { format, data } = event.data.payload;
    
    const strategy = ExportStrategies[format];

    if (strategy) {
        try {
            const result = strategy(data);
            
            self.postMessage({ type: 'EXPORT_COMPLETE', result, format });
        } catch (error) {
            self.postMessage({ type: 'EXPORT_ERROR', message: `Error al generar ${format}: ${error.message}` });
        }
    } else {
        self.postMessage({ type: 'EXPORT_ERROR', message: `Formato de exportación no soportado: ${format}` });
    }
};