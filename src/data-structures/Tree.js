import { LinkedList, Node } from './LinkedList.js';
import { Queue } from './Queue.js';

export class Tree {
    #counter;
    #map;
    #idGenerator;
    #enableIdGeneration;

    constructor(root, enableIdGeneration = true, idGenerator) {
        this.root = root;
        this.#counter = 0;
        this.#map = new Map();
        this.#enableIdGeneration = enableIdGeneration;

        if (this.root) {
            if (!this.root.data || this.root.data.id == null || (this.#enableIdGeneration && !idGenerator && typeof this.root.data.id !== 'number')) throw new Error('Invalid root node: missing id');
            const rootId = this.root.data.id;
            if (this.#enableIdGeneration && !idGenerator) {
                this.#counter = rootId + 1;
            }
            this.#map.set(rootId, this.root);
        }

        if (this.#enableIdGeneration) {
            if (idGenerator != null && typeof idGenerator !== 'function') throw new Error('Invalid idGenerator: it must either be undefined/null to use the default ID generator or a function for custom ID generators');
            this.#idGenerator = idGenerator || (() => this.#counter++);
        }
    }

    #generateId(id) {
        let mapId;

        if (this.#enableIdGeneration) {
            mapId = this.#idGenerator();
        } else if (typeof id === 'string') {
            mapId = id.trim();
            if (!mapId) throw new Error('Passed an empty ID.');
        } else if (typeof id === 'number') {
            mapId = id;
        } else {
            throw new Error('Passed an invalid ID.');
        }

        if (this.#map.has(mapId)) throw new Error('Passed an existing id');

        return mapId;
    }

    #createNewNode(id, data) {
        const newNode = new Node(null, null, {
            id, data: new TreeNode(data)
        });
        this.#map.set(id, newNode);
        return newNode;
    }

    insertParentAbove(node, data, id) {
        if (this.root && !node) {
            throw new Error('Aborted Insert Node Process: Cannot insert before a null node when the tree already has a root.');
        } else if (this.root === node) {
            throw new Error('Aborted Insert Node Process: Cannot insert before the root node.');
        }

        if (node) {
            if (!node.data || (!node.data.id && node.data.id !== 0)) throw new Error('Aborted Insert Node Process: Passed an invalid node');
            if (!this.retrieveNode(node.data.id)) throw new Error('Aborted Insert Node Process: Node doesn\'t exist in the current tree');
        }

        let mapId = this.#generateId(id);
        const newNode = this.#createNewNode(mapId, data);
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
    
        return mapId;
    }

    appendChild(parent, data, id) {
        if (this.root && parent == null) {
            throw new Error('Aborted Append Child Process: You can only create one root node');
        }

        if (parent) {
            if (!parent.data || (!parent.data.id && parent.data.id !== 0)) throw new Error('Aborted Append Child Process: Passed an invalid parent');
            if (!this.retrieveNode(parent.data.id)) throw new Error('Aborted Append Child Process: Node doesn\'t exist in the current tree');
        }
        
        const mapId = this.#generateId(id);
        const newNode = this.#createNewNode(mapId, data);
        if (!this.root && parent == null) {
            this.root = newNode;
            return mapId;
        }

        // Node -> Node.data (TreeNode) -> TreeNode.data
        parent.data.data.children.appendNode(newNode);
        return mapId;
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

export class TreeNode {
    constructor(parent, data) {
        this.parent = parent;
        this.data = data;
        this.children = new LinkedList();
    }
}