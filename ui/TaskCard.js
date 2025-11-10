// ui/TaskCard.js
import { store } from '../store/index.js';
// 🛑 Importar removeTaskFromColumn
import { updateTask, deleteTask } from '../store/tasksSlice.js'; 
import { removeTaskFromColumn } from '../store/boardSlice.js'; 


// ---------------------------------------------------
// 🛑 LÓGICA DEL MODAL DE EDICIÓN (Reemplaza a prompt)
// ---------------------------------------------------

const showEditModal = (taskId, currentTitle) => {
    const modal = document.getElementById('edit-task-modal');
    const input = document.getElementById('new-title-input');
    const saveBtn = document.getElementById('save-title-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const taskIdDisplay = document.getElementById('editing-task-id');

    taskIdDisplay.textContent = taskId;
    input.value = currentTitle;
    modal.style.display = 'block';

    saveBtn.onclick = null;
    closeBtn.onclick = null;
    window.onclick = null;
    
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Manejar cierre
    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target.classList.contains('modal-backdrop') || event.target.id === 'edit-task-modal') {
            closeModal();
        }
    };

    // Manejar guardado
    saveBtn.onclick = () => {
        const newTitle = input.value.trim();

        if (newTitle.length > 0 && newTitle !== currentTitle) {
            store.dispatch(updateTask({ 
                id: taskId, 
                updates: { title: newTitle } 
            }));
            closeModal();
        } else if (newTitle.length === 0) {
            alert('El título no puede estar vacío.');
        } else {
            closeModal();
        }
    };
};

// ---------------------------------------------------
// FUNCIÓN PRINCIPAL DE LISTENERS
// ---------------------------------------------------

export const initializeTaskCardListeners = (taskId, taskTitle) => {
    // Escucha el botón de eliminar
    const deleteBtn = document.getElementById(`delete-btn-${taskId}`);
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm(`¿Seguro que quieres eliminar la tarea #${taskId}: "${taskTitle}"?`)) {
                
                // 1. Encontrar la columna actual
                const state = store.getState();
                let colIdToRemove = null;
                for (const colId in state.board.columns) {
                    // Nota: task.id puede ser string o number dependiendo de cómo lo genera nanoid
                    if (state.board.columns[colId].taskIds.includes(String(taskId))) {
                        colIdToRemove = colId;
                        break;
                    }
                }
                
                // 2. Despachar la eliminación de la columna (NUEVA LÓGICA)
                if (colIdToRemove) {
                    store.dispatch(removeTaskFromColumn({ taskId: taskId, columnId: colIdToRemove }));
                }
                
                // 3. Despachar la eliminación del store de tareas
                store.dispatch(deleteTask(taskId));
            }
        };
    }

    // Escucha el botón de editar
    const editBtn = document.getElementById(`edit-btn-${taskId}`);
    if (editBtn) {
        editBtn.onclick = () => {
            const currentTask = store.getState().tasks.tasks[taskId];
            const currentTitle = currentTask ? currentTask.title : taskTitle;

            // 🛑 LLAMAMOS AL MODAL
            showEditModal(taskId, currentTitle);
        };
    }
};

// ---------------------------------------------------
// RENDERIZADO DE LA TARJETA (Usando clases CSS)
// ---------------------------------------------------

export const renderTaskCard = (task, assignedUser) => {
    if (!task) return '<div>Tarea no encontrada</div>';
    
    // Obtener la columna de la tarea para ondragstart
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

    // 🟢 Usamos clases CSS (necesitas main.css completo)
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