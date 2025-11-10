// ui/Board.js - Contenedor principal
import { store } from '../store/index.js';
import { moveTask, addTaskToColumn } from '../store/boardSlice.js'; 
import { createTask, clearNewTaskId } from '../store/tasksSlice.js'; 
import { renderTaskCard, initializeTaskCardListeners} from './TaskCard.js';

// NOTA: Se eliminan los estilos inline de las columnas para usar styles/main.css
// const columnStyles = 'style="border: 1px solid #ccc; padding: 10px; min-height: 200px; width: 30%; margin: 5px;"';


// ---------------------------------------------------
// 🟢 NUEVA LÓGICA DE MODAL PARA CREAR TAREA
// ---------------------------------------------------

const showCreateModal = () => {
    const modal = document.getElementById('create-task-modal');
    const input = document.getElementById('new-task-title-input');
    const submitBtn = document.getElementById('submit-new-task-btn');
    const closeBtn = document.getElementById('close-create-modal-btn');

    // Limpiar y mostrar
    input.value = '';
    modal.style.display = 'block';

    // Limpiar listeners viejos
    submitBtn.onclick = null;
    closeBtn.onclick = null;

    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeBtn.onclick = closeModal;

    // Manejar el cierre haciendo clic fuera del modal
    window.onclick = (event) => {
        if (event.target.classList.contains('modal-backdrop') || event.target.id === 'create-task-modal') {
            closeModal();
        }
    };
    
    // Manejar el envío de la tarea
    submitBtn.onclick = () => {
        const title = input.value.trim();
        const state = store.getState();
        const user = state.auth ? state.auth.user : { id: 99 };
        
        if (!user || !user.id) {
            alert("Debes iniciar sesión para crear tareas.");
            return;
        }

        if (title && title.length > 0) {
            // 1. Despachar la acción de creación
            store.dispatch(createTask({ 
                title: title, 
                userId: user.id 
            }));

            // 2. Obtener el ID de la tarea recién creada del nuevo estado
            const newState = store.getState(); 
            const newTaskId = newState.tasks.newlyCreatedTaskId;

            if (newTaskId) {
                // 3. Añadir el ID a la columna 'col-1' (To Do)
                store.dispatch(addTaskToColumn({
                    taskId: newTaskId,
                    columnId: 'col-1' 
                }));

                // 4. LIMPIAR EL ID TEMPORAL
                store.dispatch(clearNewTaskId()); 
            }
            closeModal();
        } else {
            alert('El título no puede estar vacío.');
        }
    };
};


// --- Lógica de Creación de Tareas MODIFICADA ---
const handleCreateTask = () => {
    // 🛑 Llama al nuevo modal en lugar de prompt()
    showCreateModal();
};

// 🆕 FUNCIÓN AUXILIAR: Encuentra el índice de destino más cercano
const getDropTargetIndex = (container, y) => {
    // Obtiene todos los elementos que NO están siendo arrastrados
    const taskCards = [...container.querySelectorAll('.task-list > div.task-card:not(.dragging)')];

    const result = taskCards.reduce((closest, child, index) => {
        const box = child.getBoundingClientRect();
        // Calcula el desplazamiento del puntero (y) desde el centro del elemento
        const offset = y - box.top - box.height / 2;
        
        // Si el puntero está por encima del centro del elemento (offset < 0) 
        // y es el más cercano al centro (offset > closest.offset)
        if (offset < 0 && offset > closest.offset) {
            // Devolver el índice de la tarjeta sobre la que estamos
            return { offset: offset, index: index };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, index: taskCards.length }); // El índice por defecto es el final
    
    return result.index;
};


export const renderBoard = (state) => {
    const container = document.getElementById('board-container');
    const { columns, columnOrder } = state.board;
    const allTasks = state.tasks.tasks;
    
    // Generar el HTML de todas las columnas y tarjetas
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

    // 🛑 IMPLEMENTACIÓN CRÍTICA: LLAMADA A LISTENERS
    
    // 1. Adjuntar listener del botón de Creación
    const createBtn = document.getElementById('create-task-btn');
    if (createBtn) {
        createBtn.onclick = handleCreateTask;
    }

    // 2. Adjuntar listeners de Editar/Eliminar A CADA TARJETA
    columnOrder.forEach(colId => {
        const column = columns[colId];
        column.taskIds.forEach(taskId => {
            const task = allTasks[taskId];
            if (task) {
                // Aseguramos que el ID sea string, ya que en el HTML se usa como string
                initializeTaskCardListeners(String(task.id), task.title); 
            }
        });
    });

    // --- Lógica Drag and Drop Nativa ---
    
    // Función de inicio de arrastre 
    window.handleDragStart = (e, taskId, sourceColId, sourceIndex) => {
        if (!e.dataTransfer) return; 

        // Añadir clase 'dragging' para efectos visuales (requiere CSS en main.css)
        e.currentTarget.classList.add('dragging');

        const dragData = JSON.stringify({ 
            taskId: String(taskId), 
            sourceColId, 
            sourceIndex 
        });
        
        e.dataTransfer.setData('text/plain', dragData);
        e.dataTransfer.setData('application/json', dragData);
    };

    // Función de soltar (usa la lógica de posicionamiento)
    window.handleDrop = (e, destColId) => {
        e.preventDefault();
        
        // Eliminar clase 'dragging' de la tarjeta que estaba siendo arrastrada
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
        
        // 🛑 CALCULAR EL ÍNDICE EXACTO DE INSERCIÓN
        const destColumnEl = document.getElementById(destColId).querySelector('.task-list');
        const destIndex = getDropTargetIndex(destColumnEl, e.clientY);
        
        // Despacha la acción de movimiento (IDs deben ser STRINGS)
        store.dispatch(moveTask({ 
            taskId: String(taskId), 
            sourceColId, 
            destColId, 
            sourceIndex: Number(sourceIndex), 
            destIndex // Índice calculado
        }));
    };
};