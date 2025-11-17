// FUNCIÓN: Almacena la estructura del tablero (columnas y orden de IDs de tareas).
// UTILIZA: El principio de Normalización para lograr la Actualización Optimista en Drag & Drop (splice).
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const boardSlice = createSlice({
    name: 'board',
    initialState: {
        columns: {
            // Estructura Normalizada: Las columnas solo contienen los IDs de las tareas.
            'col-1': { id: 'col-1', title: 'To Do', taskIds: ['1', '2'] }, 
            'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['3'] },
            'col-3': { id: 'col-3', title: 'Done', taskIds: [] },
        },
        columnOrder: ['col-1', 'col-2', 'col-3'], // Orden de las columnas en la UI.
    },
    reducers: {
        moveTask: (state, action) => {
            const { sourceColId, destColId, sourceIndex, destIndex, taskId } = action.payload;

            // OPERACIÓN OPTIMISTA (O(1)):
            // 1. Elimina: Remueve el taskId de la columna de origen.
            // slice() es seguro en RTK gracias a Immer (lo trata como una copia inmutable).
            state.columns[sourceColId].taskIds.splice(sourceIndex, 1);
            // 2. Inserta: Añade el taskId a la columna de destino en la posición correcta.
            state.columns[destColId].taskIds.splice(destIndex, 0, taskId);

            console.log(`[Redux] Tarea ${taskId} movida.`);
        },

        addTaskToColumn: (state, action) => {
            const { taskId, columnId } = action.payload;
            // Añade el ID de la tarea creada por tasksSlice.js al principio de la lista.
            state.columns[columnId].taskIds.unshift(taskId);
            console.log(`[Redux] Tarea #${taskId} añadida a columna ${columnId}.`);
        },

        removeTaskFromColumn: (state, action) => {
            const { taskId, columnId } = action.payload;
            if (state.columns[columnId]) {
                // Filtra el array, manteniendo solo los IDs que no coinciden con el taskId eliminado.
                state.columns[columnId].taskIds = state.columns[columnId].taskIds.filter(id => id !== taskId);
                console.log(`[Redux] Tarea ${taskId} eliminada de la columna ${columnId}.`);
            }
        },
    }
});

export const { moveTask, addTaskToColumn, removeTaskFromColumn } = boardSlice.actions; 
export default boardSlice.reducer;