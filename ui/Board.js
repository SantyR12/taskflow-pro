import { store } from '../store/index.js';
import { moveTask, addTaskToColumn } from '../store/boardSlice.js'; 
import { createTask, clearNewTaskId } from '../store/tasksSlice.js'; 
import { renderTaskCard, initializeTaskCardListeners} from './TaskCard.js';

const showCreateModal = () => {
    const modal = document.getElementById('create-task-modal');
    const input = document.getElementById('new-task-title-input');
    const submitBtn = document.getElementById('submit-new-task-btn');
    const closeBtn = document.getElementById('close-create-modal-btn');

    input.value = '';
    modal.style.display = 'block';

    submitBtn.onclick = null;
    closeBtn.onclick = null;

    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target.classList.contains('modal-backdrop') || event.target.id === 'create-task-modal') {
            closeModal();
        }
    };
    
    submitBtn.onclick = () => {
        const title = input.value.trim();
        const state = store.getState();
        const user = state.auth ? state.auth.user : { id: 99 };
        
        if (!user || !user.id) {
            alert("Debes iniciar sesión para crear tareas.");
            return;
        }

        if (title && title.length > 0) {
            store.dispatch(createTask({ 
                title: title, 
                userId: user.id 
            }));

            const newState = store.getState(); 
            const newTaskId = newState.tasks.newlyCreatedTaskId;

            if (newTaskId) {
                store.dispatch(addTaskToColumn({
                    taskId: newTaskId,
                    columnId: 'col-1' 
                }));

                store.dispatch(clearNewTaskId()); 
            }
            closeModal();
        } else {
            alert('El título no puede estar vacío.');
        }
    };
};

const handleCreateTask = () => {
    showCreateModal();
};

const getDropTargetIndex = (container, y) => {
    const taskCards = [...container.querySelectorAll('.task-list > div.task-card:not(.dragging)')];

    const result = taskCards.reduce((closest, child, index) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, index: index };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, index: taskCards.length });
    
    return result.index;
};


export const renderBoard = (state) => {
    const container = document.getElementById('board-container');
    const { columns, columnOrder } = state.board;
    const allTasks = state.tasks.tasks;
    
    container.innerHTML = `
        <div id="column-wrapper">
            ${columnOrder.map(colId => {
                const column = columns[colId];
                const taskListHTML = column.taskIds.map(taskId => 
                    renderTaskCard(allTasks[taskId], state.users.users[allTasks[taskId]?.userId])
                ).join('');

                return `
                    <div id="${colId}" 
                        ondragover="event.preventDefault();"
                        ondrop="handleDrop(event, '${colId}')">
                        <h3>${column.title} (${column.taskIds.length})</h3>
                        <div class="task-list">
                            ${taskListHTML}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <button id="create-task-btn">
            Nueva Tarea
        </button>
    `;
    const createBtn = document.getElementById('create-task-btn');
    if (createBtn) {
        createBtn.onclick = handleCreateTask;
    }

    columnOrder.forEach(colId => {
        const column = columns[colId];
        column.taskIds.forEach(taskId => {
            const task = allTasks[taskId];
            if (task) {
                initializeTaskCardListeners(String(task.id), task.title); 
            }
        });
    });

    window.handleDragStart = (e, taskId, sourceColId, sourceIndex) => {
        if (!e.dataTransfer) return; 

        e.currentTarget.classList.add('dragging');

        const dragData = JSON.stringify({ 
            taskId: String(taskId), 
            sourceColId, 
            sourceIndex 
        });
        
        e.dataTransfer.setData('text/plain', dragData);
        e.dataTransfer.setData('application/json', dragData);
    };

    window.handleDrop = (e, destColId) => {
        e.preventDefault();
        
        const draggedEl = document.querySelector('.dragging');
        if (draggedEl) {
            draggedEl.classList.remove('dragging');
        }

        const dataString = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
        
        if (!dataString) {
            console.error("Drag data is missing. Drag operation failed.");
            return; 
        }
        
        let data;
        try {
            data = JSON.parse(dataString);
        } catch (err) {
            console.error("Failed to parse drag data:", err, "Data:", dataString);
            return;
        }

        const { taskId, sourceColId, sourceIndex } = data;
        
        const destColumnEl = document.getElementById(destColId).querySelector('.task-list');
        const destIndex = getDropTargetIndex(destColumnEl, e.clientY);
        
        store.dispatch(moveTask({ 
            taskId: String(taskId), 
            sourceColId, 
            destColId, 
            sourceIndex: Number(sourceIndex), 
            destIndex 
        }));
    };
};