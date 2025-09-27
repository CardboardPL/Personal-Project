import { LinkedList, Node } from './LinkedList.js';

export class Queue {
    #linkedList

    constructor(linkedList) {
        this.#linkedList = linkedList instanceof LinkedList ? linkedList : new LinkedList();
    }

    enqueue(node) {
        if (!(node instanceof Node)) throw new Error('Aborted Enqueue process: Passed an invalid node');

        this.#linkedList.appendNode(node);
    }

    dequeue() {
        return this.#linkedList.removeNode(this.#linkedList.peekHead());
    }

    peek() {
        return this.#linkedList.peekHead();
    }

    queueSize() {
        return this.#linkedList.size();
    }
}