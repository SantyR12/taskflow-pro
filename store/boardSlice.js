import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const boardSlice = createSlice({
    name: 'board',
    initialState: {
        columns: {
            'col-1': { id: 'col-1', title: 'To Do', taskIds: ['1', '2'] }, 
            'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['3'] },
            'col-3': { id: 'col-3', title: 'Done', taskIds: [] },
        },
        columnOrder: ['col-1', 'col-2', 'col-3'],
    },
    reducers: {
        moveTask: (state, action) => {
            const { sourceColId, destColId, sourceIndex, destIndex, taskId } = action.payload;

            // Lógica de movimiento
            state.columns[sourceColId].taskIds.splice(sourceIndex, 1);
            state.columns[destColId].taskIds.splice(destIndex, 0, taskId);
            
            console.log(`[Redux] Tarea ${taskId} movida.`);
        },
        
        addTaskToColumn: (state, action) => {
            const { taskId, columnId } = action.payload;
            state.columns[columnId].taskIds.unshift(taskId);
            console.log(`[Redux] Tarea #${taskId} añadida a columna ${columnId}.`);
        },

        // 🟢 REDUCER NECESARIO PARA ELIMINAR TAREA
        removeTaskFromColumn: (state, action) => {
            const { taskId, columnId } = action.payload;
            if (state.columns[columnId]) {
                state.columns[columnId].taskIds = state.columns[columnId].taskIds.filter(id => id !== taskId);
                console.log(`[Redux] Tarea ${taskId} eliminada de la columna ${columnId}.`);
            }
        },
    }
});

// 🛑 Exportar todas las acciones
export const { moveTask, addTaskToColumn, removeTaskFromColumn } = boardSlice.actions; 
export default boardSlice.reducer;