export class LinkedList {
    #length = 0;

    constructor(head = null) {
        if (head === null) {
            this.head = null;
            this.tail = null;
        } else {
            if (!(head instanceof Node)) {
                throw new Error('Provide a valid "head" node to create a linked list.');
            }
            this.#length = this.#countItems(head, null, true);
        }
    }

    #countItems(start, end, countAndAssign) {
        let counter = 0;
        let node = start;

        if (countAndAssign) {
            this.head = start;
        }

        const set = new Set();
        while (node !== end) {
            if (node === null) throw new Error('Unreachable end node.');
            else if (set.has(node)) throw new Error('Circular References Detected.');
            set.add(node);

            if (countAndAssign && end === null) {
                this.tail = node;
            }

            node = node.next;
            counter++;
        }

        return counter;
    }

    /** Detaches a node from the list.
     * @private
     * @param {Node} node - The node being detached from the list.
     * @returns the detached node.
     */
    #detach(node) {
        if (!node.prev && node.next) { // head node
            this.head = node.next;
            this.head.prev = null;
        } else if (!node.prev && !node.next) { // single node
            this.tail = null;
            this.head = null;
        } else if (!node.next && node.prev) { // tail node
            this.tail = this.tail.prev;
            this.tail.next = null;
        } else { // middle node
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        // Reset pointers
        node.prev = null;
        node.next = null;

        return node;
    }

    prependNode(node) {
        const head = this.head;

        if (!head) {
            this.head = node;
            this.tail = node;
        } else {
            head.prev = node;
            node.next = head;
            this.head = node;
        }

        this.#length++;
        return node;
    }

    appendNode(node) {
        const tail = this.tail;

        if (!tail) {
            this.head = node;
            this.tail = node;
        } else {
            tail.next = node;
            node.prev = tail;
            this.tail = node;
        }

        this.#length++;
        return node;
    }

    splice(nodePrev, nodeNext, node, affectedNodeCount) {
        const diff = typeof affectedNodeCount === 'number' ? affectedNodeCount : this.#countItems(nodePrev ? nodePrev.next : null, nodeNext);

        if (!nodePrev) {
            this.head = node;
            node.prev = null;

            if (!nodeNext) {
                node.next = null;
                this.tail = node;
            } else {
                // Handle Next Node
                node.next = nodeNext;
                nodeNext.prev = node;
            }
        } else if (!nodeNext) {
            this.tail = node;
            node.next = null;

            // Handle Previous Node
            node.prev = nodePrev;
            nodePrev.next = node;
        } else {
            // Handle Previous Node
            node.prev = nodePrev;
            nodePrev.next = node;

            // Handle Next Node
            node.next = nodeNext;
            nodeNext.prev = node;
        }

        this.#length = this.#length + 1 - diff;
        return node;
    }

    /**
     * Insert a node before a desired node.
     * @public
     * @param {Node} nodeNext - The node before which 'node' should be inserted. If null, 'node' is appended.
     * @param {Node} node - The node being inserted.
     * @param {Boolean} nodeInList - True if the node is already in this list and must be detached first.
     * @returns the inserted node.
     */
    insertBefore(nodeNext, node, nodeInList) {
        if (nodeNext === node) return node;

        if (nodeInList) {
            this.#detach(node);
        } else {
            this.#length++;
        }

        // Insert before existing node
        if (nodeNext) {
            node.next = nodeNext;
            node.prev = nodeNext.prev;
            nodeNext.prev = node;

            if (node.prev) {
                node.prev.next = node;
            } else {
                this.head = node;
            }
        // Insert into empty list
        } else if (!this.tail) {
            this.head = node;
            this.tail = node;
            node.prev = null;
            node.next = null;
        // Append at end
        } else {
            this.tail.next = node;
            node.prev = this.tail;
            node.next = null;
            this.tail = node;
        }

        return node;
    }

    /**
     * Insert a node after a desired node.
     * @public
     * @param {Node} nodeNext - The node after which 'node' should be inserted. If null, 'node' is appended.
     * @param {Node} node - The node being inserted.
     * @param {Boolean} nodeInList - True if the node is already in this list and must be detached first.
     * @returns the inserted node.
     */
    insertAfter(nodePrev, node, nodeInList) {
        return this.insertBefore(nodePrev.next, node, nodeInList);
    }

    removeTailNode() {
        let node = null;

        if (this.head === this.tail) {
            node = this.head;
            this.head = null;
            this.tail = null;
        } else {
            node = this.tail;
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        this.#length--;
        return node;
    }

    /** Removes a desired node from the list.
     * @public
     * @param {Node} node - The node being removed from the list.
     * @returns the removed node.
     */
    removeNode(node) {
        if (!node) return null;
        this.#detach(node);
        this.#length--;
        return node;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.#length = 0;
    }

    peekHead() {
        return this.head;
    }

    peekTail() {
        return this.tail;
    }

    traverse() {
        const result = ['Null'];
        const nodes = [];

        let node = this.head;
        while (node) {
            result.push(node.data);
            nodes.push(node);
            node = node.next;
        }

        if (result.length > 1) {
            result.push('Null');
        }

        return {
            strRepresentation: result.join(' -> '),
            nodeRepresentation: nodes
        }; 
    }

    size() {
        return this.#length;
    }

    *[Symbol.iterator]() {
        let current = this.head;
        while (current) {
            yield current;
            current = current.next;
        }
    }
}

export class Node {
    constructor(data) {    
        this.prev = null;
        this.next = null;
        this.data = data;
    }
}