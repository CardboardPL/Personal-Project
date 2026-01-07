import { LinkedList, Node } from './LinkedList.js';
import { Queue } from './Queue.js';

export class IdTree {
    #root;
    #counter;
    #map;
    #idGenerator;
    #enableIdGeneration;

    constructor(rootConfig, enableIdGeneration = true, idGenerator) {
        this.#counter = 0;
        this.#map = new Map();
        this.#enableIdGeneration = enableIdGeneration;

        if (this.#enableIdGeneration) {
            if (idGenerator != null && typeof idGenerator !== 'function') throw new Error('Invalid idGenerator: it must either be undefined/null to use the default ID generator or a function for custom ID generators');
            this.#idGenerator = idGenerator || (() => this.#counter++);
        }

        if (rootConfig) {
            const { id : rootId, data : rootData = null } = rootConfig;
            this.#root = this.#createNewNode(null, null, rootData, this.#generateId(rootId), null);
        } else {
            this.#root = null;
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
            if (!Number.isFinite(id) || Number.isNaN(id)) throw new Error('Numerical IDs cannot be infinity or NaN.');
            mapId = id;
        } else {
            throw new Error('Passed an invalid ID.');
        }

        if (this.#map.has(mapId)) throw new Error('Passed an existing id');

        return mapId;
    }

    #createNewNode(prev, next, data, id, parent) {
        const newNode = new IdTreeNode(prev, next, data, id, parent);
        this.#map.set(id, newNode);
        return newNode;
    }

    #retrieveNode(nodeId) {
        return this.#map.get(nodeId);
    }

    #removeNodesFromMap(startNode) {
        const toProcess = new Queue();
        this.#map.delete(startNode.id);
        toProcess.enqueue(startNode);

        for (const node of toProcess.consume()) {
            for (const child of node.children) {
                this.#map.delete(child.id);
                toProcess.enqueue(child);
            }
        }
    }

    // The id parameter for insertParentAbove and appendChild allows the user to pass in custom ids when id generation is disabled.
    insertParentAbove(descendantNodeId, data, id) {
        if (this.#root && !descendantNodeId) {
            throw new Error('Aborted Insert Node Process: Cannot insert before a null node when the tree already has a root.');
        } else if (this.#root.id === descendantNodeId) {
            throw new Error('Aborted Insert Node Process: Cannot insert before the root node.');
        }

        const descendantNode =  this.#retrieveNode(descendantNodeId);
        if (descendantNodeId != null && !descendantNode) throw new Error('Aborted Insert Node Process: Descendant Node doesn\'t exist in the current tree');

        let mapId = this.#generateId(id);
        const newNode = this.#createNewNode(null, null, data, id, null);
        if (!this.#root && descendantNode == null) {
            this.#root = newNode;
        } else {
            // Make the parent of the original node the parent of the new node
            newNode.parent = descendantNode.parent;

            // Replace the original node in the children list of the parent node
            descendantNode.parent.children.splice(descendantNode.prev, descendantNode.next, newNode);

            // Reset original node connections
            descendantNode.prev = null;
            descendantNode.next = null;

            // Add the original node to the children list of the new node
            newNode.children.appendNode(descendantNode);
            
            // Make the parent node of the original node the new node
            descendantNode.parent = newNode;
        }
    
        return mapId;
    }

    appendChild(parentNodeId, data, id) {
        if (this.#root && parentNodeId == null) {
            throw new Error('Aborted Append Child Process: You can only create one root node');
        }

        const parentNode = this.#retrieveNode(parentNodeId);
        if (parentNodeId != null && !parentNode) throw new Error('Aborted Append Child Process: Parent Node doesn\'t exist in the current tree')
        
        const mapId = this.#generateId(id);
        const newNode = this.#createNewNode(null, null, data, id, parentNode);
        if (!this.#root && parentNode == null) {
            this.#root = newNode;
            return mapId;
        }

        parentNode.children.appendNode(newNode);
        return mapId;
    }

    retrieveNodeData(nodeId) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Parent Node ID Retrieval Process: Node doesn\'t exist in the tree');
        return node.data;
    }

    retrieveParentNodeId(nodeId) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Parent Node ID Retrieval Process: Node doesn\'t exist in the tree');
        const parentNode = node.parent;
        return parentNode ? parentNode.id : null;
    }

    retrieveChildrenNodeIds(nodeId) {
        const parentNode = this.#retrieveNode(nodeId);
        if (!parentNode) throw new Error('Aborted Parent Node ID Retrieval Process: Node doesn\'t exist in the tree');
        const idArray = [];

        for (const node of parentNode.children) {
            idArray.push(node.id);
        }

        return idArray;
    }

    updateNodeData(nodeId, data) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Node Update Process: Node doesn\'t exist in the tree.');

        node.data = data;
    }

    deleteSubtree(nodeId) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Subtree Deletion Process: Node doesn\'t exist in the tree.');

        if (this.#root === node) {
            this.#root = null;
        } else if (node.parent) {
            // Remove node from its parent's children list
            node.parent.children.removeNode(node);

            // Disconnect node from sibling references
            node.prev = null;
            node.next = null;

            // Disconnect node from its parent
            node.parent = null;
        }

        this.#removeNodesFromMap(node);
    }
}

class IdTreeNode extends Node {
    constructor(prev, next, data, id, parent) {
        super(prev, next, data);
        this.id = id;
        this.parent = parent;
        this.children = new LinkedList();
    }
}