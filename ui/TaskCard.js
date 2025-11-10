// ui/TaskCard.js
import { store } from '../store/index.js';
// 🛑 Importa las nuevas acciones de tareas.
import { updateTask, deleteTask } from '../store/tasksSlice.js'; 

// 🆕 Función auxiliar para inicializar listeners de edición/eliminación
// Esta función debe ser llamada después de que el HTML retornado por renderTaskCard 
// sea insertado en el DOM (por ejemplo, en tu función de renderizado principal del tablero).
export const initializeTaskCardListeners = (taskId, taskTitle) => {
    // Escucha el botón de eliminar
    const deleteBtn = document.getElementById(`delete-btn-${taskId}`);
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm(`¿Seguro que quieres eliminar la tarea #${taskId}: "${taskTitle}"?`)) {
                store.dispatch(deleteTask(taskId));
                // Nota: Aquí también se necesitaría una acción en boardSlice para quitar el ID de la columna
            }
        };
    }

    // Escucha el botón de editar
    const editBtn = document.getElementById(`edit-btn-${taskId}`);
    if (editBtn) {
        editBtn.onclick = () => {
            const currentTask = store.getState().tasks.tasks[taskId];
            const currentTitle = currentTask ? currentTask.title : taskTitle;

            const newTitle = prompt('Nuevo título para la tarea:', currentTask ? currentTask.title : taskTitle);

            if (newTitle !== null && newTitle.trim().length > 0 && newTitle.trim() !== currentTitle) {
                store.dispatch(updateTask({ 
                    id: taskId, 
                    updates: { title: newTitle.trim() } 
                }));
            } else if (newTitle !== null && newTitle.trim().length === 0) {
                alert('El título no puede estar vacío.');
            }
        };
    }
}


export const renderTaskCard = (task, assignedUser) => {
    if (!task) return '<div>Tarea no encontrada</div>';
    
    // Obtener la columna de la tarea para calcular el índice
    const state = store.getState();
    const board = state.board.columns;
    let sourceColId = '';
    let sourceIndex = -1;
    
    for (const colId in board) {
        const index = board[colId].taskIds.indexOf(task.id);
        if (index !== -1) {
            sourceColId = colId;
            sourceIndex = index;
            break;
        }
    }

    // 🛑 Se regresa a devolver una cadena HTML para mantener la compatibilidad con tu código.
    return `
        <div 
            id="task-card-${task.id}"
            draggable="true" 
            ondragstart="handleDragStart(event, ${task.id}, '${sourceColId}', ${sourceIndex})" 
            style="
                border: 1px solid #007bff; 
                background: #f0f8ff; 
                padding: 8px; 
                margin-bottom: 5px; 
                cursor: grab;
                display: flex; 
                justify-content: space-between; 
                align-items: center;
            "
        >
            <div style="flex-grow: 1;">
                <strong>#${task.id}:</strong> ${task.title}
                <br><small>Asignado: ${assignedUser ? assignedUser.name : 'N/A'}</small>
                <br><small>${task.lastActivity ? 'Sync: ' + task.lastActivity : ''}</small>
            </div>

            <div id="controls-${task.id}" style="display: flex; gap: 5px; flex-shrink: 0;">
                <button 
                    id="edit-btn-${task.id}" 
                    style="background: #ffc107; color: black; border: none; cursor: pointer; padding: 4px 8px;"
                >
                    Editar
                </button>
                <button 
                    id="delete-btn-${task.id}" 
                    style="background: #dc3545; color: white; border: none; cursor: pointer; padding: 4px 8px;"
                >
                    X
                </button>
            </div>
        </div>
    `;
};