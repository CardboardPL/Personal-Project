import { components } from '../data/ui.js';
import { TaskList } from '../models/Task.js';
import { Modal } from '../view/UIComponents.js';
import { EventHandlerRegistry } from '../utils/EventRegistry.js';

export const eventHandlerRegistry = new EventHandlerRegistry(['click']);

export const setUpFunctions = new Map([
    ['/taskmanager', async () => {
        let taskListElement = null;
        try {
            await components.htmlLoader('/taskmanager', 'main');
            taskListElement = components.getComponentElement('/taskmanager');
        
        } catch(e) {
            throw new Error(`Failed to load Task Manager: ${e.message}`);
        }
        
        const taskList = new TaskList("taskList1", [], taskListElement);
        
        const handleTaskStatusBtn = (e)  => {
            const taskElement = e.target.closest('li');
            const statusBtnWrapper = taskElement.querySelector('.task-status');

            const currTaskStatus = taskList.findTaskById(taskElement.dataset.taskId).status;
            const newTaskStatus = e.target.closest('.js-taskStatusBtn').dataset.taskStatus;
            
            taskElement.classList.remove(currTaskStatus);
            taskElement.classList.add(newTaskStatus);
            statusBtnWrapper.querySelector(`[data-task-status="${currTaskStatus}"]`).classList.remove('active');
            statusBtnWrapper.querySelector(`[data-task-status="${newTaskStatus}"]`).classList.add('active');

            taskList.updateTaskStatus(taskElement.dataset.taskId, newTaskStatus);
        }
        
        const handleRemoveTaskButton = (e) => {
            const taskElement = e.target.closest('li');

            taskList.removeTask(taskElement.dataset.taskId);
            taskElement.remove();
        }

        const handleCancelTaskButton = (addTaskButtonEventHandler) => {
            eventHandlerRegistry.addEventHandler('.js-addTaskButton', addTaskButtonEventHandler, 'click');
            document.querySelector('.js-addTaskButton').removeAttribute('disabled');
            addTaskModal.hideModal();
        }

        const handleAddTaskButton = (e, addTaskButtonEventHandler) => {
            e.preventDefault();

            const formData = new FormData(e.target.closest('form'));
            const taskTitle = formData.get('task-title') ? formData.get('task-title').trim() : '';
            const taskDescription = formData.get('task-description') ? formData.get('task-description').trim() : '';

            if (taskTitle) {
                taskList.addTask(taskTitle, taskDescription);
                taskListElement.innerHTML = taskList.generateTaskListHTML();

                handleCancelTaskButton(addTaskButtonEventHandler);
            }
        }

        const handleShowAddTaskModal = () => {
            if (!addTaskModal.isOpen) {
                addTaskModal.showModal();
                
                const addTaskButtonEventHandler = eventHandlerRegistry.retrieveEventHandlerFunction('.js-addTaskButton', 'click');
                document.querySelector('.js-addTaskButton').setAttribute('disabled', 'true');
                eventHandlerRegistry.removeEventHandler('.js-addTaskButton', 'click');

                eventHandlerRegistry.addEventHandler('#cancel-task-creation-button', () => {
                    handleCancelTaskButton(addTaskButtonEventHandler);
                }, 'click');

                eventHandlerRegistry.addEventHandler('#add-task-button', (e) => {
                    handleAddTaskButton(e, addTaskButtonEventHandler);
                }, 'click');
            }
        }

        const callback = (mutationList, observer) => {
            const taskListSize = taskList.size();
            const taskElem = taskListElement.querySelector('.task');
            if (taskListSize !== 0 && !eventHandlerRegistry.hasEventHandler('.js-removeTaskButton', 'click')) {
                eventHandlerRegistry.addEventHandler('.js-task', (e) => {
                    const taskModalElem = taskModal.retrieveModalElem();
                    const taskElem = e.target.closest('.js-task');
                    const task = taskList.findTaskById(taskElem.dataset.taskId);
                    
                    taskModalElem.children[0].children[1].value = task.title;
                    taskModalElem.children[0].children[2].value = task.description;

                    taskModal.showModal();

                    eventHandlerRegistry.addEventHandler('.js-taskModalCloseButton', () => {
                        taskModal.hideModal();
                    }, 'click');

                    eventHandlerRegistry.addEventHandler('.js-taskModalSaveButton', (e) => {
                        const fieldset = e.target.closest('fieldset');

                        const taskTitleElem = fieldset.children[1];
                        const taskDescriptionElem = fieldset.children[2];

                        const newTaskTitle = taskTitleElem.value.trim();
                        const newTaskDescription = taskDescriptionElem.value.trim();

                        if (newTaskTitle !== '') {
                            taskList.updateTaskDetails(task, newTaskTitle, newTaskDescription, 'taskObject');

                            taskElem.children[0].children[0].textContent = newTaskTitle;
                            taskElem.children[1].textContent = newTaskDescription;
                            taskModal.hideModal();
                        }
                    }, 'click');
                }, 'click');
                eventHandlerRegistry.addEventHandler('.js-taskStatusBtn', handleTaskStatusBtn, 'click');
                eventHandlerRegistry.addEventHandler('.js-removeTaskButton', handleRemoveTaskButton, 'click');   
            } else if (taskListSize === 0 && taskElem) {
                eventHandlerRegistry.removeEventHandler('.js-task', 'click');
                eventHandlerRegistry.removeEventHandler('.js-removeTaskButton', 'click');
                eventHandlerRegistry.removeEventHandler('.js-taskStatusBtn', 'click');
            }
        }
        const observer = new MutationObserver(callback);
        observer.observe(taskListElement, { childList: true });

        taskListElement.innerHTML = taskList.generateTaskListHTML();

        const addTaskModal = new Modal(document.querySelector('.js-addTaskModal'), [{ id: '#cancel-task-creation-button', event: 'click' }, { id: '#add-task-button', event: 'click' }], eventHandlerRegistry);
        const taskModal = new Modal(document.querySelector('.js-taskModal'), [{ id: '.js-taskModalCloseButton', event: 'click' }, { id: '.js-taskModalSaveButton', event: 'click' }], eventHandlerRegistry);
        eventHandlerRegistry.addEventHandler('.js-addTaskButton', handleShowAddTaskModal, 'click');
    }]
]);