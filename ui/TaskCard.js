import { store } from '../store/index.js'; // es el objeto redux que es el almacen central de la app
import { updateTask, deleteTask } from '../store/tasksSlice.js'; // Es la accion del redux para modificar (título) o eliminar la tarea del slice 'tasks'.
import { removeTaskFromColumn } from '../store/boardSlice.js'; // Es la accion del redux para eliminar la referencia (ID) de la tarea de una columna específica.

// Función privada para mostrar y configurar la lógica del modal de edición.
const showEditModal = (taskId, currentTitle) => {
    // Obtiene referencias de los elementos del DOM 
    const modal = document.getElementById('edit-task-modal');
    const input = document.getElementById('new-title-input');
    const saveBtn = document.getElementById('save-title-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const taskIdDisplay = document.getElementById('editing-task-id');

    // Configuración inicial del modal antes de mostrarlo.
    taskIdDisplay.textContent = taskId; // Muestra el ID de la tarea que se está editando.
    input.value = currentTitle; // Precarga el título actual en el campo de entrada.
    modal.style.display = 'block'; // Hace visible el modal.

    // Limpieza de listeners 
    saveBtn.onclick = null;
    closeBtn.onclick = null;
    window.onclick = null;
    
    // Función local para ocultar el modal.
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Configuración de los listeners de cierre.
    closeBtn.onclick = closeModal; // Cierra el modal al hacer clic en el botón 'X'.
    window.onclick = (event) => { // Cierra el modal si el clic ocurre fuera del contenido principal.
        if (event.target.classList.contains('modal-backdrop') || event.target.id === 'edit-task-modal') {
            closeModal();
        }
    };

    // Configuración del listener del botón de guardar.
    saveBtn.onclick = () => {
        const newTitle = input.value.trim(); // Obtiene el nuevo título

        // Lógica de validación y guardado.
        if (newTitle.length > 0 && newTitle !== currentTitle) {
            // Condición: El título no puede estar vacio y debe ser diferente al original.
            store.dispatch(updateTask({ // Despacha la acción para actualizar el título de la tarea.
                id: taskId, 
                updates: { title: newTitle } // Envía el nuevo título como actualización.
            }));
            closeModal(); // Cierra el modal después de guardar.
        } else if (newTitle.length === 0) {
            // Condición: Título vacío.
            alert('El título no puede estar vacío.'); // Muestra advertencia.
        } else {
            // Condición: El título es igual al original (no hay cambios que guardar).
            closeModal(); // Cierra sin hacer dispatch.
        }
    };
};

export const initializeTaskCardListeners = (taskId, taskTitle) => {
    // Configuración del botón de ELIMINAR.
    const deleteBtn = document.getElementById(`delete-btn-${taskId}`);
    if (deleteBtn) { // Verifica que el botón exista.
        deleteBtn.onclick = () => {
            // Muestra un cuadro de diálogo de confirmación antes de proceder.
            if (confirm(`¿Seguro que quieres eliminar la tarea #${taskId}: "${taskTitle}"?`)) {
                const state = store.getState(); // Obtiene una instantánea del estado actual de Redux.
                let colIdToRemove = null;
                // Itera sobre todas las columnas del tablero.
                for (const colId in state.board.columns) {
                    // Verifica si el ID de la tarea está incluido en la lista taskIds de esta columna.
                    if (state.board.columns[colId].taskIds.includes(String(taskId))) {
                        colIdToRemove = colId; // Si la encuentra, guarda el ID de la columna.
                        break; // Sale del bucle para ahorrar tiempo.
                    }
                }
                
                if (colIdToRemove) {
                    // Quitar la referencia (ID) de la columna.
                    store.dispatch(removeTaskFromColumn({ taskId: taskId, columnId: colIdToRemove }));
                }
                
                // Eliminar el objeto tarea del almacén principal de tareas.
                store.dispatch(deleteTask(taskId));
            }
        };
    }

    // Configuración del botón de EDITAR.
    const editBtn = document.getElementById(`edit-btn-${taskId}`);
    if (editBtn) { // Verifica que el botón exista.
        editBtn.onclick = () => {
            // Obtiene el título más reciente de la tarea directamente del estado de Redux.
            const currentTask = store.getState().tasks.tasks[taskId];
            const currentTitle = currentTask ? currentTask.title : taskTitle;

            showEditModal(taskId, currentTitle); // Llama a la función para mostrar el modal de edición.
        };
    }
};

// Función exportada para generar el HTML de una tarjeta de tarea.
export const renderTaskCard = (task, assignedUser) => {
    if (!task) return '<div>Tarea no encontrada</div>'; // Manejo de error si la tarea es nula.
    
    // Lógica de Drag and Drop
    const state = store.getState();
    const board = state.board.columns;
    let sourceColId = '';
    let sourceIndex = -1;
    
    // Bucle para encontrar la columna a la que pertenece la tarea y su índice dentro de ella.
    for (const colId in board) {
        const index = board[colId].taskIds.indexOf(task.id);
        if (index !== -1) {
            sourceColId = colId; // ID de la columna de origen.
            sourceIndex = index; // Posición de la tarea dentro de esa columna.
            break;
        }
    }
    
    // Retorna la estructura HTML de la tarjeta de tarea
    return `
        <div 
            id="task-card-${task.id}"
            class="task-card"
            draggable="true" 
            ondragstart="handleDragStart(event, '${task.id}', '${sourceColId}', ${sourceIndex})" 
        >
            <div class="card-title"><strong>#${task.id}:</strong> ${task.title}</div>
            <small class="card-meta">Asignado: ${assignedUser ? assignedUser.name : 'N/A'}</small>
            <small class="card-meta">${task.lastActivity ? 'Sync: ' + task.lastActivity : ''}</small>

            <div class="card-controls">
                <button 
                    id="edit-btn-${task.id}" 
                    class="edit-btn"
                >
                    ✏️
                </button>
                <button 
                    id="delete-btn-${task.id}" 
                    class="delete-btn"
                >
                    🗑️
                </button>
            </div>
        </div>
    `;
};