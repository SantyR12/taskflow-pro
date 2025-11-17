
import { store } from '../store/index.js';
import { moveTask, addTaskToColumn } from '../store/boardSlice.js'; 
import { createTask, clearNewTaskId } from '../store/tasksSlice.js'; 
import { renderTaskCard, initializeTaskCardListeners} from './TaskCard.js';

const showCreateModal = () => {
    // Obtenemos referencias a los elementos del DOM del modal.
    const modal = document.getElementById('create-task-modal');
    const input = document.getElementById('new-task-title-input');
    const submitBtn = document.getElementById('submit-new-task-btn');
    const closeBtn = document.getElementById('close-create-modal-btn');
    // Reseteamos el estado visual del modal.
    input.value = '';
    modal.style.display = 'block';

    // ¡¡¡CRÍTICO!!! Limpiamos los listeners 'onclick' ANTES de volver a asignarlos.
    // Esto previene que se acumulen listeners duplicados si el modal se
    // abre y cierra múltiples veces, lo que causaría la creación de múltiples tareas.
    submitBtn.onclick = null;
    closeBtn.onclick = null;

    // Función 'helper' interna para cerrar el modal.
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Asignamos el evento al botón de cerrar.
    closeBtn.onclick = closeModal;

    // Asignamos el evento para cerrar el modal si se hace clic fuera de él (en el fondo).
    window.onclick = (event) => {
        if (event.target.classList.contains('modal-backdrop') || event.target.id === 'create-task-modal') {
            closeModal();
        }
    };
    
    submitBtn.onclick = () => {
        const title = input.value.trim();// Obtenemos el título (limpio de espacios).
        const state = store.getState();// Obtenemos el estado ACTUAL de Redux.
        const user = state.auth ? state.auth.user : { id: 99 };// Obtenemos el usuario
        
        if (!user || !user.id) {
            alert("Debes iniciar sesión para crear tareas.");
            return;
        }

        // Validación simple.
        if (title && title.length > 0) {
            // 1. Despachamos 'createTask'. El 'tasksSlice' (reducer) se encargará de
            //    manejar la lógica (quizás una llamada API) y añadir la tarea al estado 'tasks.tasks'.
            store.dispatch(createTask({ 
                title: title, 
                userId: user.id 
            }));
            
            // 2. Obtenemos el 'newState' (el estado *después* de la acción anterior).
            const newState = store.getState(); 
            // 3. El 'tasksSlice' debió poner el ID de la nueva tarea en este estado temporal.
            const newTaskId = newState.tasks.newlyCreatedTaskId;

            if (newTaskId) {
                // 4. Si el ID existe, despachamos 'addTaskToColumn' para que el 'boardSlice'
                //    actualice sus columnas y añada este ID a 'col-1' (Por Hacer).
                store.dispatch(addTaskToColumn({
                    taskId: newTaskId,
                    columnId: 'col-1' // Se añade a la primera columna por defecto. 
                }));

                // 5. Limpiamos el estado temporal.
                store.dispatch(clearNewTaskId()); 
            }
            closeModal();// 6. Cerramos el modal.
        } else {
            alert('El título no puede estar vacío.');
        }
    };
};

const handleCreateTask = () => {
    showCreateModal();
};

const getDropTargetIndex = (container, y) => {
    // Obtenemos todas las tarjetas en la columna, EXCEPTO la que estamos arrastrando.
    const taskCards = [...container.querySelectorAll('.task-list > div.task-card:not(.dragging)')];

    // Usamos 'reduce' para encontrar el "hueco" más cercano.
    const result = taskCards.reduce((closest, child, index) => {
        const box = child.getBoundingClientRect(); // Posición y tamaño de la tarjeta 'child'.
        // Calculamos la distancia vertical desde el *centro* de la tarjeta hasta el puntero.
        const offset = y - box.top - box.height / 2;

        // Si el offset es negativo (el puntero está *arriba* del centro)
        // y es el más cercano a 0 que hemos encontrado (mayor que el 'closest.offset' anterior)
        if (offset < 0 && offset > closest.offset) {
            // hemos encontrado un nuevo "hueco" más cercano. Guardamos su índice.
            return { offset: offset, index: index };
        } else {
            // si no, seguimos con el 'closest' que ya teníamos.
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, index: taskCards.length });

    // Devolvemos el índice calculado.
    return result.index;
};


export const renderBoard = (state) => {
    const container = document.getElementById('board-container');
    // Desestructuramos el estado para un acceso más fácil.
    const { columns, columnOrder } = state.board;
    const allTasks = state.tasks.tasks;

    // Usamos 'innerHTML' para renderizar todo el tablero.
    // Esto es más rápido de implementar que el DOM virtual, pero tiene
    // la desventaja de que borra y re-dibuja todo, perdiendo listeners.
    container.innerHTML = `
        <div id="column-wrapper">
            ${columnOrder.map(colId => {
                // Iteramos sobre 'columnOrder' para garantizar el orden de las columnas.
                const column = columns[colId];
                // Iteramos sobre los 'taskIds' de esta columna.
                const taskListHTML = column.taskIds.map(taskId => 
                    // Delegamos la renderización de cada tarjeta a 'renderTaskCard' (importado).
                    // Le pasamos los datos de la tarea y del usuario asignado.
                    renderTaskCard(allTasks[taskId], state.users.users[allTasks[taskId]?.userId])
                ).join('');

                // Devolvemos el HTML de la columna completa.
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

    // Dado que 'innerHTML' borró todos los listeners de JS, debemos volver a asignarlos.
    const createBtn = document.getElementById('create-task-btn');
    if (createBtn) {
        // Asignamos el handler al nuevo botón "Nueva Tarea".
        createBtn.onclick = handleCreateTask;
    }

    // Iteramos sobre todas las tareas que acabamos de renderizar
    columnOrder.forEach(colId => {
        const column = columns[colId];
        column.taskIds.forEach(taskId => {
            const task = allTasks[taskId];
            if (task) {
                // y llamamos a 'initializeTaskCardListeners' (importado) para
                // asignar los listeners específicos de cada tarjeta (ej. 'ondragstart').
                initializeTaskCardListeners(String(task.id), task.title); 
            }
        });
    });

    // Asignamos estas funciones al objeto 'window' para que los atributos
    // 'ondrop' y 'ondragstart' (que están en el string HTML) puedan encontrarlas.

    window.handleDragStart = (e, taskId, sourceColId, sourceIndex) => {
        if (!e.dataTransfer) return; 

        // Añadimos una clase CSS para el feedback visual (ej. opacidad).
        e.currentTarget.classList.add('dragging');

        // Creamos un objeto 'dragData' con la información esencial sobre
        // la tarjeta que se está moviendo (qué es y de dónde viene).
        const dragData = JSON.stringify({ 
            taskId: String(taskId), 
            sourceColId, 
            sourceIndex 
        });
        
        // Guardamos estos datos en 'dataTransfer' para que 'handleDrop' pueda leerlos.
        e.dataTransfer.setData('text/plain', dragData);
        e.dataTransfer.setData('application/json', dragData);
    };

    window.handleDrop = (e, destColId) => {
        e.preventDefault();// Prevenimos el comportamiento por defecto del navegador.

        // Limpiamos el feedback visual (quitamos la clase '.dragging').
        const draggedEl = document.querySelector('.dragging');
        if (draggedEl) {
            draggedEl.classList.remove('dragging');
        }

        // Obtenemos los datos (string JSON) que guardamos en 'handleDragStart'.
        const dataString = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
        
        if (!dataString) {
            console.error("Drag data is missing. Drag operation failed.");
            return; 
        }
        
        let data;
        try {
            data = JSON.parse(dataString);// Parseamos el string JSON a un objeto.
        } catch (err) {
            console.error("Failed to parse drag data:", err, "Data:", dataString);
            return;
        }
        // Desestructuramos los datos de origen.
        const { taskId, sourceColId, sourceIndex } = data;
        
        // Obtenemos el elemento DOM de la lista de tareas de destino.
        const destColumnEl = document.getElementById(destColId).querySelector('.task-list');

        // Usamos nuestra utilidad para calcular el ÍNDICE exacto donde se soltó
        const destIndex = getDropTargetIndex(destColumnEl, e.clientY);

        // En lugar de eso, despachamos la acción 'moveTask' a Redux
        // con toda la información: qué mover, de dónde, a dónde y en qué posición.
        store.dispatch(moveTask({ 
            taskId: String(taskId), 
            sourceColId, // Columna de origen
            destColId, // Columna de destino
            sourceIndex: Number(sourceIndex), // Índice de origen
            destIndex // Índice de destino
        }));
    };
};
