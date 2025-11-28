import { LinkedList, Node } from "../../data-structures/LinkedList.js";

export class TaskList {
    #storageId;

    constructor(storageId) {
        if (!storageId) {
            throw new Error('Provide a storageId to create a task list.');
        } else if(typeof storageId !== 'string') {
            throw new Error('The provided storageId must be a string.');
        }

        this.#storageId = storageId;
        this.taskStore = {
            map: new Map(),
            linkedList: new LinkedList(),
            counter: 0,
        }

        this.#init();
    }

    #init() {
        const data = this.#retrieveTaskList();

        if (data.taskListArr && data.taskMapArr && data.taskCounter) {
            let counter = 0;
            for (const id of data.taskListArr) {
                const taskInfo = data.taskMapArr[counter];

                if (!this.#isValidTaskData(id, taskInfo)) continue;

                const taskTitle = taskInfo.title.trim();
                if (!taskTitle) continue;

                const node = this.taskStore.linkedList.appendNode(new Node(null, null, id));
                
                this.taskStore.map.set(id, {
                    taskData: new Task(taskTitle, taskInfo.description.trim(), taskInfo.status),
                    node
                });
                counter++;
            }

            this.taskStore.counter = data.taskCounter;
        }

        this.verifyDataIntegrity(true);
    }

    #isValidTaskData(id, taskInfo) {
        if (!taskInfo) return false;

        const taskStatus = taskInfo.status;
        return (
            typeof id === 'number' &&
            typeof taskInfo.title === 'string'&&
            typeof taskInfo.description === 'string' &&
            typeof taskStatus === 'number' && 
            (taskStatus <= 2 && taskStatus >= 0) &&
            (id >= 0 && id % 1 === 0)
        );
    }

    #removeMismatches() {
        const taskListIds = new Set();

        let current = this.taskStore.linkedList.head;
        let mismatches = 0;
        while (current) {
            const id = current.value;
            const nextNode = current.next;

            taskListIds.add(id);
            const taskData = this.retrieveTaskData(id);

            if (!taskData) {
                this.taskStore.linkedList.removeNode(current);
                mismatches++;
            }

            current = nextNode;
        }

        for (const [key, value] of this.taskStore.map) {
            if (!taskListIds.has(key)) {
                this.taskStore.map.delete(key);
                mismatches++;
            }
        }

        this.#saveTaskList();
        return mismatches;
    }

    #validateTaskData(process, title, description, status) {
        if (typeof status !== 'number' || status % 1 !== 0 || status < 0 || status > 2) {
            throw new Error(`${process} process aborted. Provide a valid status id to ${process.toLowerCase()}. Received ID:${status}, expected id to be a valid integer.`);
        }
        if (typeof title !== 'string') {
            throw new Error(`${process} process aborted. Provided title must be of type "string".`);
        }
        if (typeof description !== 'string') {
            throw new Error(`${process} process aborted. Provided description must be of type "string".`);
        }
    }

    #cleanAndValidateTitle(process, title) {
        const cleanedTitle = title.trim();
        if (cleanedTitle === '') {
            throw new Error(`${process} process aborted. Provide a non-empty title to proceed.`);
        }
        return cleanedTitle;
    }

    #retrieveTaskList() {
        const taskListArr = JSON.parse(localStorage.getItem(`${this.#storageId}-v1-taskList`));
        const taskMapArr = JSON.parse(localStorage.getItem(`${this.#storageId}-v1-map`));
        const taskCounter = JSON.parse(localStorage.getItem(`${this.#storageId}-v1-counter`));
        return { taskListArr, taskMapArr, taskCounter };        
    }

    #saveTaskList() {
        // Package the taskList and the taskMap
        const taskListArr = [];
        const taskMapArr = [];

        let current = this.taskStore.linkedList.head;

        while (current) {
            const taskId = current.data;
            const taskData = this.retrieveTaskData(taskId);

            taskListArr.push(taskId);
            taskMapArr.push(taskData);
            
            current = current.next;
        }

        // Save the packaged data
        localStorage.setItem(`${this.#storageId}-v1-map`, JSON.stringify(taskMapArr));
        localStorage.setItem(`${this.#storageId}-v1-taskList`, JSON.stringify(taskListArr));
        localStorage.setItem(`${this.#storageId}-v1-counter`, JSON.stringify(this.taskStore.counter));
    }

    #createTaskId() {
        this.taskStore.counter++;
        return this.taskStore.counter;
    }

    createTask(title, description = '', initialStatus = 0) {
        // Input Validation
        this.#validateTaskData('Task creation', title, description, initialStatus);
        const cleanedTitle = this.#cleanAndValidateTitle('Task creation', title);

        const taskId = this.#createTaskId();
        const newTask = new Task(cleanedTitle, description.trim(), initialStatus);
        const taskNode = new Node(null, null, taskId);
        this.taskStore.map.set(taskId, {
            taskData: newTask,
            node: taskNode
        });
        this.taskStore.linkedList.appendNode(taskNode);

        this.#saveTaskList();

        return taskId;
    }

    retrieveTask(id) {
        const task = this.taskStore.map.get(id);

        if (!task) return null;

        const taskData = task.taskData;
        const taskNode = task.node;

        return Object.freeze({
            taskData: {
                title: taskData.title,
                description: taskData.description,
                status: taskData.status
            },
            node: {
                previousNodeId: taskNode.prev ? taskNode.prev.value : null,
                nextNodeId: taskNode.next ? taskNode.next.value : null,
                value: taskNode.value
            }
        });
    }

    retrieveTaskData(id) {
        const task = this.retrieveTask(id);

        if (task) {
            return task.taskData;
        }

        return null;
    }

    retrieveTaskNode(id) {
        const task = this.retrieveTask(id);

        if (task) {
            return task.node;
        }

        return null;
    }

    updateTask(id, title, description, status) {
        let task = this.taskStore.map.get(id);

        if (!task) {
            throw new Error(`Task update process aborted. Provide a valid integer id to update the task. ID: ${id}, doesn't exist in the registry.`);
        }

        task = task.taskData;

        this.#validateTaskData('Task update', title, description, status);
        const cleanedTitle = this.#cleanAndValidateTitle('Task update', title);
        const cleanedDescription = description.trim();

        let hasChanged = false;
        if (task.title !== cleanedTitle) {
            task.title = cleanedTitle;
            hasChanged = true;
        }

        if (task.description !== cleanedDescription) {
            task.description = cleanedDescription;
            hasChanged = true;
        }

        if (task.status !== status) {
            task.status = status;
            hasChanged = true
        }
        
        if (hasChanged) this.#saveTaskList();
        return hasChanged;
    }

    deleteTask(id) {
        const task = this.taskStore.map.get(id);

        if (!task) {
            throw new Error(`Task deletion process aborted. Provide a valid integer id to delete a task. ID: ${id}, doesn't exist in the registry.`);
        }

        // Delete from the linked list
        this.taskStore.linkedList.removeNode(task.node);
        // Delete from the Map
        this.taskStore.map.delete(id);

        this.#saveTaskList();
    }

    verifyDataIntegrity(removeMismatches = false) {
        const taskMapSize = this.taskStore.map.size;
        const taskListSize = this.taskStore.linkedList.size();
        let isValid = true;
        let message = 'Did not find any integrity issues.';

        try {
            if (taskMapSize !== taskListSize) {
                isValid = false;
                throw new Error(`Task Map and Task List size mismatch. taskMap=${taskMapSize}, taskList=${taskListSize}`);
            }
        } catch(err) {
            if (removeMismatches) this.#removeMismatches();
            message = err.message;
        }

        return {
            valid: isValid,
            message,
            taskMapSize,
            taskListSize
        };
    }

    *taskEntries() {
        let current = this.taskStore.linkedList.head;
        while (current) {
            yield [current.data, this.retrieveTask(current.data).taskData];
            current = current.next;
        }
    }
}

class Task {
    constructor(title, description, status) {
        this.title = title;
        this.description = description;
        this.status = status;
    }
}