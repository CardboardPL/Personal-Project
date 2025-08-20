import { escapeHTML } from '../utility-modules/sanitize.js';

export class TaskRenderer {
    #taskListId;
    #taskList;

    constructor(taskListId, taskList) {
        this.#taskListId = taskListId;
        this.#taskList = taskList;
    }

    generateTaskHTML(taskId) {
        const task = this.#taskList.retrieveTask(taskId);
        if (!task) throw new Error(`Task HTML Generation Operation Aborted. Task with id: ${taskId} doesn't exist.`);
        const taskInfo = task.taskData;
        const taskTitle = escapeHTML(taskInfo.title);
        return `
            <li class="task-card js-task-card" data-id="${taskId}">
                <ul class="card-tags-list js-card-tags" aria-label="Task Tags">
                    <li class="card-tag"><span class="visually-hidden">Pending</span></li>
                </ul>

                <h3 class="card-title js-card-title">${taskTitle}</h3>
                <p class="card-description js-card-description">${escapeHTML(taskInfo.description)}</p>
                <button type="button" class="card-delete-button js-card-delete-button" aria-label="Delete task ${taskTitle}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>                  
                </button>
            </li>
        `;
    }

    renderTask(taskId) {
        document.querySelector(this.#taskListId).insertAdjacentHTML('beforeend', this.generateTaskHTML(taskId));
    }

    renderTaskList() {
        let html = '';

        for (const [id, taskInfo] of this.#taskList.taskEntries()) {
            const taskTitle = escapeHTML(taskInfo.title);
            html += `
                <li class="task-card js-task-card" data-id="${id}">
                    <ul class="card-tags-list js-card-tags" aria-label="Task Tags">
                        <li class="card-tag"><span class="visually-hidden">Pending</span></li>
                    </ul>

                    <h3 class="card-title js-card-title">${taskTitle}</h3>
                    <p class="card-description js-card-description">${escapeHTML(taskInfo.description)}</p>
                    <button type="button" class="card-delete-button js-card-delete-button" aria-label="Delete task ${taskTitle}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                            </svg>                  
                    </button>
                </li>
            `;
        }

        document.querySelector(this.#taskListId).innerHTML = html;
    }

    rerenderTask(id) {
        const taskInfo = this.#taskList.retrieveTaskData(id);
        const taskCard = document.querySelector(`.js-task-card[data-id="${id}"]`);
        
        // Update Task Card Title
        taskCard.querySelector('.js-card-title').innerText = taskInfo.title;

        // Update Task Card Description
        taskCard.querySelector('.js-card-description').innerText = taskInfo.description;
    }
}