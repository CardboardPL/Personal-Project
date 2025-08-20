export class TaskList {
    static validStatuses = ['Pending', 'In-progress', 'Completed'];
    #taskListId;
    #tasks
    #taskCounter = 0;

    constructor(taskListId, tasks = [], elem) {
        this.#taskListId = taskListId;
        
        this.#tasks = [...this.retrieveFromStorage(), ...tasks];
        this.#saveToStorage();
        
        this.previousNow = null;
        this.elem = elem;
    }

    addTask(title, description, status = 'Pending') {
        if (!title || title.trim() === '') {
            console.error('The Task must have a title.');
            return;
        }

        const taskData = new Task(
            this.#generateTaskId(),
            title,
            description,
            status
        );

        this.#tasks.push(taskData);
        this.#saveToStorage();
    }

    updateTaskTitle(id, title) {
        const task = this.findTaskById(id);
        if (task == null) {
            console.error('Task not found');
            return;
        }

        task.updateTaskTitle(title);
        this.#saveToStorage();
    }

    updateTaskDescription(id, description) {
        const task = this.findTaskById(id);
        if (task == null) {
            console.error('Task not found');
            return;
        }

        task.updateTaskDescription(description);
        this.#saveToStorage();
    }

    updateTaskDetails(id, title, description, mode = 'id') {
        let task;

        switch (mode) {
            case 'id':
                task = this.findTaskById(id);
                break;
            case 'taskObject':
                task = id;
                break;
            default:
                task = null;
        }

        if (task == null) {
            console.error('Task not found');
            return;
        }

        task.updateTaskTitle(title);
        task.updateTaskDescription(description);
        this.#saveToStorage();
    }

    updateTaskStatus(id, newStatus) {
        if (!TaskList.validStatuses.includes(newStatus)) {
            console.error('Invalid Status');
            return;
        }

        const task = this.findTaskById(id);

        if (task == null) {
            console.error('Task not found');
            return;
        }

        task.status = newStatus;
        this.#saveToStorage();
    }

    removeTask(id) {
        const isFound = this.findTaskById(id);

        if (isFound) {
            this.#tasks = this.#tasks.filter((task) =>  task.id !== id);
            this.#saveToStorage();
        } else {
            console.error('Task not found with id ' + id);
        }
    }


    findTaskById(id) {
        return this.#tasks.find(task => task.id === id) || null;
    }

    #saveToStorage() {
        localStorage.setItem(this.#taskListId, JSON.stringify(this.#tasks));
    }

    retrieveFromStorage() {
        const parsedItem = JSON.parse(localStorage.getItem(this.#taskListId));
        return Array.isArray(parsedItem) 
            ? parsedItem.map(task => new Task(task.id, task.title, task.description, task.status)) 
            : [];
    }

    generateTaskListHTML() {
        return this.#tasks.map(task => task.generateTaskHTML()).join('');
    }

    size() {
        return this.#tasks.length;
    }

    #generateTaskId() {
        const now = Date.now();

        if (now === this.previousNow) {
            this.#taskCounter++;
        } else {
            this.#taskCounter = 1;
            this.previousNow = now;
        }

        return `${this.#taskCounter}-${now}-${Math.random().toString(36).substring(2, 9)}`;
    }
}

class Task {
    constructor(id, title, description, status = 'Pending') {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
    }

    generateTaskHTML() {
        return `
            <li class="task ${this.status} js-task" data-task-id="${this.id}">
                <header class="task-header">
                    <h3 class="task-title">${this.title}</h3>
                    
                    <button type="button" class="task-remove-button js-removeTaskButton">
                        <svg aria-label="Remove Task" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <p class="task-description">${this.description}</p>

                <div class="task-status" aria-label="Task Status">
                    ${this.#generateTaskStatusBtn()}
                </div>
            </li>
        `;
    }

    #generateTaskStatusBtn() {
        return `
            <button class="status-btn js-taskStatusBtn ${this.status === 'Pending' ? 'active' : ''}" type="button" data-task-status="Pending">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Pending</span>
            </button>
            <button class="status-btn js-taskStatusBtn ${this.status === 'In-progress' ? 'active' : ''}" type="button" data-task-status="In-progress">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>In-progress</span>
            </button>
            <button class="status-btn js-taskStatusBtn ${this.status === 'Completed' ? 'active' : ''}" type="button" data-task-status="Completed">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Completed</span>
            </button>
        `;
    }

    updateTaskTitle(title) {
        title = title.trim();

        if (typeof title !== 'string') {
            console.error('Rejected Task Title Update.\n Expected "title" to be of type "string" but received "' + typeof title + '".');
            return;
        } else if (title === '') {
            console.error('Rejected Task Title Update.\n "title" must not be an empty string');
            return
        }

        this.title = title;
    }

    updateTaskDescription(description) {
        description = description.trim();

        if (typeof description !== 'string') {
            console.error('Rejected Task Description Update.\n Expected "description" to be of type "string" but received "' + typeof description + '".');
            return;
        }

        this.description = description;
    }
}