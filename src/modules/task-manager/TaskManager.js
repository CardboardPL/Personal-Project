import { TaskList } from "./TaskList.js";
import { TaskRenderer } from "./TaskRenderer.js";

export class TaskManager {
    #taskList;
    #taskRenderer;

    constructor(storageId, taskListId) {
        if (typeof storageId !== 'string') throw new Error('Invalid storageId argument: storageId must be of type "string".');
        if (typeof taskListId !== 'string') throw new Error('Invalid taskListId argument: taskListId must be of type "string".');

        [ storageId, taskListId ] = [ storageId.trim(), taskListId.trim() ];

        if (!storageId) throw new Error('Invalid storageId argument: storageId must not be empty');
        if (!taskListId) throw new Error('Invalid taskListId argument: taskListId must not be empty');

        this.#taskList = new TaskList(storageId);
        this.#taskRenderer = new TaskRenderer(taskListId, this.#taskList);
    }

    #validateId(id) {
        if (typeof id !== 'number') throw new Error('Invalid id argument: id must be of type "number".');
        if (id < 0 || !Number.isInteger(id)) throw new Error('Invalid id argument: id must be a non-negative integer');
    }

    createTask(title, description = '', initialStatus = 0, renderTask = true) {
        const id = this.#taskList.createTask(title, description, initialStatus);
        if (renderTask) this.#taskRenderer.renderTask(id);
        return id;
    }

    retrieveTask(id) {
        this.#validateId(id);
        return this.#taskList.retrieveTask(id);
    }

    retrieveTaskData(id) {
        this.#validateId(id);
        return this.#taskList.retrieveTaskData(id);
    }

    retrieveTaskNode(id) {
        this.#validateId(id);
        return this.#taskList.retrieveTaskNode(id);
    }

    updateTask(id, title, description, status, rerenderTask = true) {
        this.#validateId(id);
        const hasChanged = this.#taskList.updateTask(id, title, description, status);
        if (rerenderTask) this.#taskRenderer.rerenderTask(id);
        return hasChanged;
    }

    deleteTask(id) {
        this.#validateId(id);
        this.#taskList.deleteTask(id);
        const taskCard = document.querySelector(`[data-id=${id}]`);
        if (taskCard) taskCard.remove();
    }

    renderTaskList() {
        this.#taskRenderer.renderTaskList();
    }
}