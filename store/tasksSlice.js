// store/tasksSlice.js - Almacena los detalles de la tarea
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

// Función simple de simulación de nanoid
const nanoid = () => Math.random().toString(36).substring(2, 9); 

const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: {
            '1': { id: '1', title: 'Diseñar Mockups', userId: 1, completed: false },
            '2': { id: '2', title: 'Configurar Redux Store', userId: 1, completed: false },
            '3': { id: '3', title: 'Implementar Singleton API', userId: 2, completed: false },
        },
        newlyCreatedTaskId: null, // 🛑 NUEVA PROPIEDAD para el ID temporal
    },
    reducers: {
        createTask: (state, action) => {
            const { title, userId } = action.payload;
            
            const newTaskId = nanoid(); 
            
            const newTask = {
                id: newTaskId,
                title,
                userId,
                completed: false,
                lastActivity: new Date().toISOString()
            };

            // 1. Mutación: Agregar la nueva tarea
            state.tasks[newTaskId] = newTask;
            
            // 2. Mutación: Guardar el ID de la tarea recién creada
            state.newlyCreatedTaskId = newTaskId;
            
            console.log(`[Redux] Nueva tarea #${newTaskId} creada.`);
            
            // 🛑 ¡ELIMINADO EL RETURN CONFLICTIVO! Immer maneja el estado.
        },
        
        clearNewTaskId: (state) => {
            state.newlyCreatedTaskId = null;
        },

        setTasks: (state, action) => {
            const normalizedTasks = Object.keys(action.payload).reduce((acc, key) => {
                acc[String(key)] = { ...action.payload[key], id: String(action.payload[key].id) };
                return acc;
            }, {});
            state.tasks = normalizedTasks;
            console.log(`[Redux] Tareas cargadas desde Worker 1 (${Object.keys(action.payload).length} tareas).`);
        },
        
        updateTaskFromSync: (state, action) => {
            const { taskId, update } = action.payload;
            if (state.tasks[taskId]) {
                state.tasks[taskId] = { ...state.tasks[taskId], ...update };
                console.log(`[Redux] Tarea #${taskId} actualizada por Sync Worker.`);
            }
        },

        updateTask: (state, action) => {
            const { id, updates } = action.payload;
            if (state.tasks[id]) {
                const lastActivity = updates.lastActivity || new Date().toISOString();
                state.tasks[id] = { ...state.tasks[id], ...updates, lastActivity };
                console.log(`[Redux] Tarea #${id} actualizada desde la UI.`);
            }
        },

        deleteTask: (state, action) => {
            const taskId = action.payload;
            delete state.tasks[taskId];
            console.log(`[Redux] Tarea #${taskId} eliminada.`);
        }
    }
});

// 🛑 Exportar todas las acciones, incluyendo clearNewTaskId
export const { setTasks, updateTaskFromSync, updateTask, deleteTask, createTask, clearNewTaskId } = tasksSlice.actions;
export default tasksSlice.reducer;