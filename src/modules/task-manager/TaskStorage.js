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
        this.#taskTree = new Tree();
    }
}