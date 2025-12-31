import { Queue } from './../../data-structures/Queue.js';
import { Tree } from './../../data-structures/Tree.js';

export class TaskStorage {
    #storageId;
    #taskTree;

    constructor(storageId) {
        if (typeof storageId !== 'string') {
            throw new Error('Invalid storageId: storageId must be a string.');
        }

        storageId = storageId.trim();
        if (!storageId) {
            throw new Error('Invalid storageId: storageId must not be empty.');
        }

        this.#storageId = storageId;
        this.#taskTree = new Tree(null, false);
        this.#getFromStorage();
    }

    #getFromStorage() {
        /* Structure of Stored Data
            [{
                globalId
                taskData: {...}
                },
                children: [...]
            }] 
        */
        // Retrieve Data From Storage
        const rawData = JSON.parse(localStorage.getItem(this.#storageId));

        // Verify if it's valid
        if (!rawData) {
            return;
        } else if (!Array.isArray(rawData)) {
            throw new Error('Invalid Storage Location: storage location stores the wrong data type.');
        }

        // Represent the raw data in the tree
        const queue = new Queue();
        if (rawData.length > 0) {
            queue.enqueue({
                parentId: null,
                data: rawData[0]
            });
        }

        while (queue.queueSize()) {
            const { parentId, data } = queue.dequeue();
            const currNodeParent = this.#taskTree.retrieveNode(parentId);
            const { globalId, taskData, children } = data;

            if ((!globalId && globalId !== 0) || !taskData || !Array.isArray(children)) {
                throw new Error('Invalid Task Data');
            }
            this.#taskTree.appendChild(currNodeParent, taskData, globalId);

            for (const child of children) {
                queue.enqueue({
                    parentId: globalId,
                    data: child
                });
            }
        }
    }
}