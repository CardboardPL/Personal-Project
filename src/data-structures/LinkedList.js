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

    insertBefore(nodeNext, node, nodeInList) {
        if (nodeInList) {
            if (node.prev && node.next) {
                node.prev.next = node.next;
                node.next.prev = node.prev;
            } else if (node.prev && !node.next && this.tail === node) {
                node.prev.next = null;
                this.tail = node.prev;
            } else if (!node.prev && node.next && this.head === node) {
                node.next.prev = null;
                this.head = node.next;
            } else if (nodeNext === node && !node.prev && !node.next) {
                return node;         
            } else if (nodeNext != null) {
                throw new Error('Next node isn\'t on the list.');   
            }
        } else {
            this.#length++;
        }

        if (nodeNext) {
            node.next = nodeNext;
            node.prev = nodeNext.prev;
            nodeNext.prev = node;

            if (node.prev) {
                node.prev.next = node;
            } else {
                this.head = node;
            }
        } else if (!this.tail) {
            this.head = node;
            this.tail = node;
            node.prev = null;
            node.next = null;
        } else {
            this.tail.next = node;
            node.prev = this.tail;
            node.next = null;
            this.tail = node;
        }

        return node;
    }

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

    removeNode(node) {
        if (!node) return null;

        if (!node.prev && node.next) {
            this.head = node.next;
            this.head.prev = null;
        } else if (!node.prev && !node.next) {
            this.tail = null;
            this.head = null;
        } else if (!node.next && node.prev) {
            this.tail = this.tail.prev;
            this.tail.next = null;
        } else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        
        node.prev = null;
        node.next = null;

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