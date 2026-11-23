import { LinkedList, Node } from "./LinkedList.js";

export class LRUCache {
    #maxCapacity;
    #list;
    #map;

    constructor(maxCapacity) {
        if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) throw new Error('Expected maxCapacity to be a positive integer');
        this.#maxCapacity = maxCapacity;
        this.#list = new LinkedList();
        this.#map = new Map();
    }

    add(key, data) {
        if (this.#map.has(key)) throw new Error('Tried adding an item with an existing key');

        if (this.#list.size() + 1 > this.#maxCapacity) {
            const node = this.#list.removeTailNode();
            this.#map.delete(node.data[0]);
        }
        const node = new Node([key, data]);
        this.#list.prependNode(node);
        this.#map.set(key, node);
    }

    get(key) {
        const node = this.#map.get(key);
        if (!node) return undefined;
        this.#list.prependNode(node, true);
        return node.data[1];
    }

    has(key) {
        return this.#map.has(key);
    }

    update(key, data) {
        const node = this.#map.get(key);
        if (!node) return false;
        node.data[1] = data;
        this.#list.prependNode(node, true);
        return true;
    }

    remove(key) {
        const node = this.#map.get(key);
        if (!node) return false;
        this.#list.removeNode(node);
        this.#map.delete(key);
        return true;
    }
}