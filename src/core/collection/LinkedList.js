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
            head.prev = null;
            this.head = head;

            const visited = new Set();
            let curr = head;
            let prev = null;
            while (curr !== null) {
                if (visited.has(curr)) throw new Error('Circular References detected');
                if (curr.prev !== prev) throw new Error('Malformed node objects detected');
                if (curr.next === null) {
                    this.tail = curr;
                }
                visited.add(curr);
                prev = curr;
                curr = curr.next;
                this.#length++;
            }
        }
    }

    #countItems(start, end) {
        let counter = 0;
        let node = start;

        const set = new Set();
        while (node !== end) {
            if (node === null) throw new Error('Unreachable end node.');
            else if (set.has(node)) throw new Error('Circular References Detected.');
            set.add(node);
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
        if (this.head === node && this.tail === node) {
            this.head = null;
            this.tail = null;
        } else if (this.head === node) {
            this.head = node.next;
            this.head.prev = null;
        } else if (this.tail === node) {
            this.tail = node.prev;
            this.tail.next = null;
        } else {
            if (!node.prev || !node.next) throw new Error('Passed an unlinked foreign node while detaching');
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        // Reset pointers
        node.prev = null;
        node.next = null;

        return node;
    }

    prependNode(node, nodeInList = false) {
        if (!node || !(node instanceof Node)) throw new Error('Expected node to prepend to the list');
        if (nodeInList) {
            if (node === this.head) return node;
            this.#detach(node);
        } else {
            node.prev = null;
            node.next = null;
            this.#length++;
        }

        const head = this.head;

        if (!head) {
            this.head = node;
            this.tail = node;
        } else {
            head.prev = node;
            node.next = head;
            this.head = node;
        }

        return node;
    }

    appendNode(node, nodeInList = false) {
        if (!node || !(node instanceof Node)) throw new Error('Expected a node to append to the list');
        if (nodeInList) {
            if (node === this.tail) return node;
            this.#detach(node);
        } else {
            node.prev = null;
            node.next = null;
            this.#length++;
        }

        const tail = this.tail;

        if (!tail) {
            this.head = node;
            this.tail = node;
        } else {
            tail.next = node;
            node.prev = tail;
            this.tail = node;
        }

        return node;
    }

    splice(nodePrev, nodeNext, node, affectedNodeCount = null) {
        if (!(nodePrev instanceof Node) && nodePrev !== null) throw new Error('Invalid nodePrev argument: nodePrev must be an instance of Node or null');
        if (!(nodeNext instanceof Node) && nodeNext !== null) throw new Error('Invalid nodeNext argument: nodeNext must be an instance of Node or null');
        if (!(node instanceof Node) && node !== null) throw new Error('Invalid node argument: node must be an instance of Node or null');
        if (affectedNodeCount !== null && (!Number.isInteger(affectedNodeCount) || affectedNodeCount < 0)) throw new Error('Invalid affectedNodeCount argument');

        if (!this.head && (nodePrev || nodeNext)) throw new Error('Tried splicing an empty list');
        const diff = 
            !nodePrev && !nodeNext ? this.#length : 
            typeof affectedNodeCount === 'number' ? affectedNodeCount : this.#countItems(nodePrev ? nodePrev.next : this.head, nodeNext);

        // Handle no node case
        if (!node) {
            if (!nodePrev) {
                if (!nodeNext) {
                    this.head = null;
                    this.tail = null;
                } else {
                    nodeNext.prev = null;
                    this.head = nodeNext;
                }
            } else {
                if (!nodeNext) {
                    nodePrev.next = null;
                    this.tail = nodePrev;
                } else {
                    nodePrev.next = nodeNext;
                    nodeNext.prev = nodePrev;
                }
            }

            this.#length -= diff;
            return null;
        }

        // Handle one node case
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
    insertBefore(nodeNext, node, nodeInList = false) {
        if (nodeNext !== null && !(nodeNext instanceof Node)) throw new Error('Expected a reference node or null');
        if (!node || !(node instanceof Node)) throw new Error('Expected a node to be inserted');
        if (nodeNext === node) return node;
        
        if (nodeInList) {
            this.#detach(node);
        } else {
            node.prev = null;
            node.next = null;
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
     * @param {Node} nodePrev - The node after which 'node' should be inserted. If null, 'node' is prepended.
     * @param {Node} node - The node being inserted.
     * @param {Boolean} nodeInList - True if the node is already in this list and must be detached first.
     * @returns the inserted node.
     */
    insertAfter(nodePrev, node, nodeInList = false) {
        return this.insertBefore(nodePrev ? nodePrev.next : this.head, node, nodeInList);
    }

    removeTailNode() {
        if (!this.head) {
            return null;
        }

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
        node.prev = null;
        return node;
    }

    /** Removes a desired node from the list.
     * @public
     * @param {Node} node - The node being removed from the list.
     * @returns the removed node.
     */
    removeNode(node) {
        if (!(node instanceof Node) && node !== null) throw new Error('Tried deleting an invalid node');
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
            const next = current.next;
            yield current;
            current = next;
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