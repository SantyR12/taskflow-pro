// store/boardSlice.js - Mantiene la estructura para Drag and Drop (rápido)
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const boardSlice = createSlice({
    name: 'board',
    initialState: {
        columns: {
            // Asegúrate que los IDs sean strings si nanoid los genera como strings
            'col-1': { id: 'col-1', title: 'To Do', taskIds: ['1', '2'] }, 
            'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['3'] },
            'col-3': { id: 'col-3', title: 'Done', taskIds: [] },
        },
        columnOrder: ['col-1', 'col-2', 'col-3'],
    },
    reducers: {
        moveTask: (state, action) => {
            const { sourceColId, destColId, sourceIndex, destIndex, taskId } = action.payload;

            // Lógica de movimiento simplificada
            state.columns[sourceColId].taskIds.splice(sourceIndex, 1);
            state.columns[destColId].taskIds.splice(destIndex, 0, taskId);
            
            console.log(`[Redux] Tarea ${taskId} movida.`);
        },
        
        // 🛑 ACCIÓN PARA AÑADIR NUEVA TAREA
        addTaskToColumn: (state, action) => {
            const { taskId, columnId } = action.payload;
            // Agrega el ID al principio de la columna especificada (ej. 'col-1')
            state.columns[columnId].taskIds.unshift(taskId);
            console.log(`[Redux] Tarea #${taskId} añadida a columna ${columnId}.`);
        }
    }
});

export const { moveTask, addTaskToColumn } = boardSlice.actions; // 🛑 Exportar addTaskToColumn
export default boardSlice.reducer;