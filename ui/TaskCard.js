import { store } from '../store/index.js';
import { updateTask, deleteTask } from '../store/tasksSlice.js'; 
import { removeTaskFromColumn } from '../store/boardSlice.js'; 

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

    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target.classList.contains('modal-backdrop') || event.target.id === 'edit-task-modal') {
            closeModal();
        }
    };

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


export const initializeTaskCardListeners = (taskId, taskTitle) => {
    const deleteBtn = document.getElementById(`delete-btn-${taskId}`);
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm(`¿Seguro que quieres eliminar la tarea #${taskId}: "${taskTitle}"?`)) {
                
                const state = store.getState();
                let colIdToRemove = null;
                for (const colId in state.board.columns) {
                    if (state.board.columns[colId].taskIds.includes(String(taskId))) {
                        colIdToRemove = colId;
                        break;
                    }
                }
                
                if (colIdToRemove) {
                    store.dispatch(removeTaskFromColumn({ taskId: taskId, columnId: colIdToRemove }));
                }
                
                store.dispatch(deleteTask(taskId));
            }
        };
    }
    const editBtn = document.getElementById(`edit-btn-${taskId}`);
    if (editBtn) {
        editBtn.onclick = () => {
            const currentTask = store.getState().tasks.tasks[taskId];
            const currentTitle = currentTask ? currentTask.title : taskTitle;

            showEditModal(taskId, currentTitle);
        };
    }
};

export const renderTaskCard = (task, assignedUser) => {
    if (!task) return '<div>Tarea no encontrada</div>';
    
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