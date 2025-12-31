import { LinkedList, Node } from './LinkedList.js';

export class Queue {
    #linkedList

    constructor(linkedList) {
        this.#linkedList = linkedList instanceof LinkedList ? linkedList : new LinkedList();
    }

    enqueue(data) {
        const node = new Node(null, null, data);
        this.#linkedList.appendNode(node);
    }

    dequeue() {
        return this.#linkedList.removeNode(this.#linkedList.peekHead()).data;
    }

    peek() {
        return this.#linkedList.peekHead().data;
    }

    queueSize() {
        return this.#linkedList.size();
    }
}