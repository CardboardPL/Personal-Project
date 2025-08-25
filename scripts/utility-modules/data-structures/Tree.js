import { LinkedList, Node } from './LinkedList.js';
import { Queue } from './Queue.js';

export class Tree {
    #counter;
    #map;

    constructor(root, counter) {
        this.root = root;
        this.#counter = counter || 0;
        this.#map = new Map();
    }

    #generateId() {
        return this.#counter++;
    }

    insertParentAbove(node, data) {
        if (this.root && !node) {
            throw new Error('Aborted Insert Node Process: Cannot insert before a null node when the tree already has a root.');
        } else if (this.root === node) {
            throw new Error('Aborted Insert Node Process: Cannot insert before the root node.');
        }

        if (node) {
            if (!node.data || !node.data.id) throw new Error('Aborted Insert Node Process: Passed an invalid node');
            if (!this.retrieveNode(node.data.id)) throw new Error('Aborted Insert Node Process: Node doesn\'t exist in the current tree');
        }

        const id = this.#generateId();

        if (this.#map.has(id)) {
            throw new Error('Aborted Insert Node Process: Passed an existing id');
        }

        const newNode = new Node(null, null, {
            id, data: new TreeNode(null, data)
        });

        this.#map.set(id, newNode);
        if (!this.root && node == null) {
            this.root = newNode;   
        } else {
            // Node -> Node.data (TreeNode) ->  TreeNode.data

            // Make the parent of the original node the parent of the new node
            newNode.data.data.parent = node.data.data.parent;

            // Replace the original node in the children list of the parent node
            node.data.data.parent.data.data.children.insertNode(node.prev, node.next, newNode);

            // Reset original node connections
            node.prev = null;
            node.next = null;

            // Add the original node to the children list of the new node
            newNode.data.data.children.appendNode(node);
            
            // Make the parent node of the original node the new node
            node.data.data.parent = newNode;
        }
    
        return id;
    }

    appendChild(parent, data) {
        if (this.root && parent == null) {
            throw new Error('Aborted Append Child Process: You can only create one root node');
        }

        if (parent) {
            if (!parent.data || (!parent.data.id && parent.data.id !== 0)) throw new Error('Aborted Append Child Process: Passed an invalid parent');
            if (!this.retrieveNode(parent.data.id)) throw new Error('Aborted Append Child Process: Node doesn\'t exist in the current tree');
        }
        
        const id = this.#generateId();

        if (this.#map.has(id)) {
            throw new Error('Aborted Insert Node Process: Passed an existing id');
        }

        const newNode = new Node(null, null, {
            id, data: new TreeNode(parent, data)
        });

        this.#map.set(id, newNode);
        if (!this.root && parent == null) {
            this.root = newNode;
            return id;
        }

        // Node -> Node.data (TreeNode) -> TreeNode.data
        parent.data.data.children.appendNode(newNode);
        return id;
    }

    deleteSubtree(nodeId) {
        const node = this.retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Subtree Deletion Process: Node doesn\'t exist in the tree.');

        if (this.root === node) {
            this.root = null;
        } else if (node.data.data.parent) {
            // Remove node from its parent's children list
            node.data.data.parent.data.data.children.removeNode(node);

            // Disconnect node from sibling references
            node.prev = null;
            node.next = null;

            // Disconnect node from its parent
            node.data.data.parent = null;
        }

        this.#removeNodesFromMap(node);
    }

    #removeNodesFromMap(startNode) {
        const toProcess = new Queue();
        this.#map.delete(startNode.data.id);
        toProcess.enqueue(startNode);
        
        while (toProcess.queueSize()) {
            for (const child of toProcess.dequeue().data.data.children) {
                this.#map.delete(child.data.id);
                toProcess.enqueue(child);
            }
        }
    }

    retrieveNode(nodeId) {
        return this.#map.get(nodeId);
    }

    updateNodeData(nodeId, data) {
        const node = this.retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Node Update Process: Node doesn\'t exist in the tree.');

        node.data.data.data = data;
    }
}

class TreeNode {
    constructor(parent, data) {
        this.parent = parent;
        this.data = data;
        this.children = new LinkedList();
    }
}