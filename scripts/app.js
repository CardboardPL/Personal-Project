'use strict';

import { TaskList } from '../src/modules/task-manager/TaskList.js';
import { setup as modalSetup } from '../src/modules/task-manager/TaskModal.js';
import { TaskRenderer } from '../src/modules/task-manager/TaskRenderer.js';

// Initialize the Task List and Task Renderer
const list = new TaskList('1234');
const taskRenderer = new TaskRenderer('.task-list', list);

// Cache essential elements
const modalContainer = document.querySelector('.js-modal-container');
const modalContainerControls = modalSetup(modalContainer, 'creation');
const openCreationFormButton = document.querySelector('.js-task-create-button');

// Handle Task Creation
const openCreationFormButtonHandler = () => {
    modalContainerControls.setModalMode('creation');
    modalContainerControls.openModal();
    openCreationFormButton.removeEventListener('click', openCreationFormButtonHandler);

    const createTaskButton = modalContainer.querySelector('.js-form-submit-button');
    const cancelButton = modalContainer.querySelector('.js-form-cancel-button');
    const overlay = document.querySelector('.js-overlay');
    overlay.classList.remove('visually-hidden');

    const titleTextarea = document.querySelector('#task-title');
    titleTextarea.focus();

    function handleCreationModalClose() {
        // Close modal
        modalContainerControls.closeModal();

        // Remove modal specific event listeners
        cancelButton.removeEventListener('click', handleCreationModalClose);
        createTaskButton.removeEventListener('click', handleCreateTask);
        overlay.removeEventListener('click', handleCreationModalClose);
        overlay.classList.add('visually-hidden');
        document.removeEventListener('keyup', handleEscapeKeyPress);

        // Bring back the event listener to the open creation form button
        openCreationFormButton.addEventListener('click', openCreationFormButtonHandler);
    }

    function handleEscapeKeyPress(e) {
        if (e.key === 'Escape') {
            handleCreationModalClose();
        }
    }

    function handleCreateTask(e) {
        e.preventDefault();

        const title = titleTextarea.value.trim();
        const description = document.querySelector('#task-description').value;

        if (title) {
            const taskId = list.createTask(title, description);
            taskRenderer.renderTask(taskId);
            handleCreationModalClose();
        }
    }

    document.addEventListener('keyup', handleEscapeKeyPress);
    cancelButton.addEventListener('click', handleCreationModalClose);
    createTaskButton.addEventListener('click', handleCreateTask);
    overlay.addEventListener('click', handleCreationModalClose);
}

// Handle Task Editing
function handleTaskCardClick(e) {
    openCreationFormButton.removeEventListener('click', openCreationFormButtonHandler);

    const taskId = Number(e.target.closest('.js-task-card').dataset.id);
    const taskInfo = list.retrieveTaskData(taskId);
    modalContainerControls.setModalMode('update');
    modalContainerControls.openModal();

    const taskTitleElem = document.querySelector('#task-title');
    const taskDescriptionElem = document.querySelector('#task-description');

    taskTitleElem.value = taskInfo.title;
    taskDescriptionElem.value = taskInfo.description;
    document.querySelector(`#status-${taskInfo.status}`).click();

    function handleUpdateModalClose() {
        // Close modal
        modalContainerControls.closeModal();

        // Remove modal specific event listeners
        cancelButton.removeEventListener('click', handleUpdateModalClose);
        updateTaskButton.removeEventListener('click', handleUpdateTask);
        overlay.removeEventListener('click', handleUpdateModalClose);
        overlay.classList.add('visually-hidden');
        document.removeEventListener('keyup', handleEscapeKeyPress);

        // Bring back the event listener to the open creation form button
        openCreationFormButton.addEventListener('click', openCreationFormButtonHandler);
    }

    function handleEscapeKeyPress(e) {
        if (e.key === 'Escape') {
            handleUpdateModalClose();
        }
    }
    
    function handleUpdateTask(e) {
        e.preventDefault();
        const title = taskTitleElem.value.trim();
    
        if (title) {
            const description = taskDescriptionElem.value.trim();
            const status = Number(document.querySelector('input[type="radio"]:checked').value);

            list.updateTask(taskId, title, description, status);
            taskRenderer.rerenderTask(taskId);
            handleUpdateModalClose();
        }
    }

    const updateTaskButton = modalContainer.querySelector('.js-form-submit-button');
    const cancelButton = modalContainer.querySelector('.js-form-cancel-button');
    const overlay = document.querySelector('.js-overlay');
    overlay.classList.remove('visually-hidden');

    document.addEventListener('keyup', handleEscapeKeyPress);
    cancelButton.addEventListener('click', handleUpdateModalClose);
    updateTaskButton.addEventListener('click', handleUpdateTask);
    overlay.addEventListener('click', handleUpdateModalClose);
}


// Link up the elements to their respective functions
document.addEventListener('click', (e) => {
    e.stopPropagation();
    if (modalContainerControls.isOpen) return;

    const deleteButton = e.target.closest('.js-card-delete-button');
    if (deleteButton) {
        const taskCard = deleteButton.closest('.js-task-card');
        list.deleteTask(Number(taskCard.dataset.id));
        taskCard.remove();
    } else if (e.target.closest('.js-task-card')) {
        handleTaskCardClick(e);
    }
});

// do onload functions
openCreationFormButton.addEventListener('click', openCreationFormButtonHandler);
taskRenderer.renderTaskList();