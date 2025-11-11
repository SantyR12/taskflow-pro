// 🧩 FUNCIÓN: Almacena el diccionario de detalles completos de todas las tareas (datos ricos).
// 📡 UTILIZA: El Prefetch Worker para la carga inicial y el Sync Worker para actualizaciones en tiempo real.
import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
// Función utilitaria: genera un ID aleatorio corto. Simula un ID de cliente rápido.
const nanoid = () => Math.random().toString(36).substring(2, 9); 

const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: {
            // El estado inicial es un diccionario para acceso O(1) por ID
            '1': { id: '1', title: 'Diseñar Mockups', userId: 1, completed: false },
            '2': { id: '2', title: 'Configurar Redux Store', userId: 1, completed: false },
            '3': { id: '3', title: 'Implementar Singleton API', userId: 2, completed: false },
        },
        
        newlyCreatedTaskId: null,// Campo temporal para coordinar la creación con boardSlice.
    },
    reducers: {
        createTask: (state, action) => {
            const { title, userId } = action.payload;
            
            const newTaskId = nanoid();  // Generación del ID optimista.
            // ... datos
            const newTask = {
                id: newTaskId,
                title,
                userId,
                completed: false,
                lastActivity: new Date().toISOString()
            };

            state.tasks[newTaskId] = newTask; // Inserta la tarea instantáneamente.
            
            state.newlyCreatedTaskId = newTaskId;
            
            console.log(`[Redux] Nueva tarea #${newTaskId} creada.`);
            
        },
        
        clearNewTaskId: (state) => {
            state.newlyCreatedTaskId = null; // Limpia la referencia temporal.
        },

        setTasks: (state, action) => {
            // Receptor del Worker 1 (Prefetch). Recibe la carga útil completa.
            const normalizedTasks = Object.keys(action.payload).reduce((acc, key) => {
                // Asegura la normalización: claves y IDs como strings.
                acc[String(key)] = { ...action.payload[key], id: String(action.payload[key].id) };
                return acc;
            }, {});
            state.tasks = normalizedTasks; // Sobreescribe el estado inicial con los datos del servidor.
            console.log(`[Redux] Tareas cargadas desde Worker 1 (${Object.keys(action.payload).length} tareas).`);
        },
        
        updateTaskFromSync: (state, action) => {
            // Receptor de eventos del Worker 2 (Sync).
            const { taskId, update } = action.payload;
            if (state.tasks[taskId]) {
                // Spread Operator: Sobreescribe solo las propiedades que han cambiado (update).
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

export const { setTasks, updateTaskFromSync, updateTask, deleteTask, createTask, clearNewTaskId } = tasksSlice.actions;
export default tasksSlice.reducer;