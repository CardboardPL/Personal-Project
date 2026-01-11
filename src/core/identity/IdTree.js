import { LinkedList, Node } from './../collection/LinkedList.js';
import { Queue } from './../collection/Queue.js';
import { IdRegistry } from './IdRegistry.js';

export class IdTree {
    #root;
    #registry;

    constructor(rootConfig, enableIdGeneration = true, idGenerator) {
        this.#registry = new IdRegistry(enableIdGeneration, idGenerator);

        if (rootConfig) {
            const { id : rootId, data : rootData = null } = rootConfig;
            this.#root = this.#registerNode(rootData, rootId, null).newNode;
        } else {
            this.#root = null;
        }
    }

    /** Registers a node to the tree.
     * @private
     * @param {any} data - The data that the node will hold.
     * @param {any} id - The ID of the node.
     * @param {IdTreeNode} parent - The parent of the node.
     * @returns {{newNode, mapId}} an object containing the node created and its associated ID.
     */
    #registerNode(data, id, parent) {
        const newNode = new IdTreeNode(data, id, parent);
        const mapId = this.#registry.setItem(id, newNode);
        return { newNode, mapId };
    }

    /** Retrieves a node from the registry via an ID.
     * @private
     * @param {any} nodeId - The ID of the node being retrieved.
     * @returns {IdTreeNode|null} an IdTreeNode with the given nodeId or null if it doesn't exist.
     */
    #retrieveNode(nodeId) {
        return this.#registry.getItem(nodeId);
    }

    /** Determines whether a node can be moved relative to a target node.
     * @private
     * @param {IdTreeNode} node - The node being moved.
     * @param {IdTreeNode} targetNode - The reference node.
     * @returns {boolean} True if the move is allowed; false otherwise.
     * @throws Will throw an error if the move violates tree invariants (e.g., moving the root or moving relative to the root).
     */
    #canMove(node, targetNode) {
        if (!node) throw new Error('Aborted Move Node Process: Unknown node.');
        if (!targetNode) throw new Error('Aborted Move Node Process: Unknown target node.');
        if (node === this.#root) throw new Error('Aborted Move Node Process: Moving the root is not allowed.');
        if (targetNode === this.#root) throw new Error('Aborted Move Node Process: Moving a node relative to the root is not allowed.');
        if (node === targetNode) return false;
        return true;
    }

    /** Removes the IDs of a given subtree from the registry.
     * @private
     * @param {IdTreeNode} startNode - The root of the subtree being removed.
     */
    #removeNodesFromMap(startNode) {
        const toProcess = new Queue();
        this.#registry.removeItem(startNode.id);
        toProcess.enqueue(startNode);

        for (const node of toProcess.consume()) {
            for (const child of node.children) {
                this.#registry.removeItem(child.id);
                toProcess.enqueue(child);
            }
        }
    }

    /** Detaches a desired node from its parent list
     * @private
     * @param {IdTreeNode} node - The node being detached. 
     * @returns {IdTreeNode} the detached node.
     */
    #detach(node) {
        const ls = node.parent.children;
        return ls.removeNode(node);
    }

    /** Inserts a new node above a given node.
     * @public
     * @param {any} descendantNodeId - The ID of the node that will become the child of the new node.
     * @param {any} data - The data to store in the new parent node.
     * @param {any} [id] - A custom ID that will be used if ID generation is disabled. Required if ID generation is disabled.
     * @returns {any} the ID of the inserted node.
     */
    insertParentAbove(descendantNodeId, data, id) {
        if (this.#root && !descendantNodeId) {
            throw new Error('Aborted Insert Node Process: Cannot insert before a null node when the tree already has a root.');
        } else if (this.#root.id === descendantNodeId) {
            throw new Error('Aborted Insert Node Process: Cannot insert before the root node.');
        }

        const descendantNode =  this.#retrieveNode(descendantNodeId);
        if (descendantNodeId != null && !descendantNode) throw new Error('Aborted Insert Node Process: Descendant Node doesn\'t exist in the current tree');

        const { newNode, mapId } = this.#registerNode(data, id, null);
        if (!this.#root && descendantNode == null) {
            this.#root = newNode;
        } else {
            // Make the parent of the original node the parent of the new node
            newNode.parent = descendantNode.parent;

            // Replace the original node in the children list of the parent node
            descendantNode.parent.children.splice(descendantNode.prev, descendantNode.next, newNode, 1);

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

    /** Appends a child node to a parent node.
     * @public
     * @param {any} parentNodeId - The ID of the parent node.
     * @param {any} data - The data to store in the appended node.
     * @param {any} [id] - A custom ID that will be used if ID generation is disabled. Required if ID generation is disabled.
     * @returns {any} the ID of the appended node.
     */
    appendChild(parentNodeId, data, id) {
        if (this.#root && parentNodeId == null) {
            throw new Error('Aborted Append Child Process: You can only create one root node');
        }

        const parentNode = this.#retrieveNode(parentNodeId);
        if (parentNodeId != null && !parentNode) throw new Error('Aborted Append Child Process: Parent Node doesn\'t exist in the current tree')
        
        const { newNode, mapId } = this.#registerNode(data, id, parentNode);
        if (!this.#root && parentNode == null) {
            this.#root = newNode;
            return mapId;
        }

        parentNode.children.appendNode(newNode);
        return mapId;
    }

    /** Retrieves the data of a given node.
     * @public
     * @param {any} nodeId - The ID of the target node.
     * @returns {any} the data of a given node.
     */
    retrieveNodeData(nodeId) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Parent Node ID Retrieval Process: Node doesn\'t exist in the tree');
        return node.data;
    }

    /** Retrieves the ID of the parent of a given node.
     * @public
     * @param {any} nodeId - The ID of the target node.
     * @returns the ID of the parent node or null if the target node doesn't have a parent node.
     */
    retrieveParentNodeId(nodeId) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Parent Node ID Retrieval Process: Node doesn\'t exist in the tree');
        const parentNode = node.parent;
        return parentNode ? parentNode.id : null;
    }

    /** Retrieves the IDs of the children nodes of a given node.
     * @public
     * @param {any} nodeId  - The ID of the target node.
     * @returns {(any)[]} an array of IDs representing the children nodes of the target node.
     */
    retrieveChildrenNodeIds(nodeId) {
        const parentNode = this.#retrieveNode(nodeId);
        if (!parentNode) throw new Error('Aborted Parent Node ID Retrieval Process: Node doesn\'t exist in the tree');
        const idArray = [];

        for (const node of parentNode.children) {
            idArray.push(node.id);
        }

        return idArray;
    }

    /** Overwrites the data of a given node.
     * @public
     * @param {any} nodeId - The ID of the target node.
     * @param {any} data - The new data.
     */
    overwriteNodeData(nodeId, data) {
        const node = this.#retrieveNode(nodeId);
        if (!node) throw new Error('Aborted Node Update Process: Node doesn\'t exist in the tree.');

        node.data = data;
    }

    /** Moves a node before a target node.
     * @public
     * @param {any} nodeId - The ID of the node being moved.
     * @param {any} targetNodeId - The ID of the target node.
     * @returns {any} the id of the node that was moved.
     */
    moveNodeBefore(nodeId, targetNodeId) {
        const node = this.#retrieveNode(nodeId);
        const targetNode = this.#retrieveNode(targetNodeId);
        
        // Safety checks
        if (!this.#canMove(node, targetNode)) {
            return node.id;
        }

        return targetNode.parent.children.insertBefore(targetNode, this.#detach(node), false).id;
    }

    /** Moves a node after a target node.
     * @public
     * @param {any} nodeId - The ID of the node being moved.
     * @param {any} targetNodeId - The ID of the target node.
     * @returns {any} the id of the node that was moved.
     */
    moveNodeAfter(nodeId, targetNodeId) {
        const node = this.#retrieveNode(nodeId);
        const targetNode = this.#retrieveNode(targetNodeId);

        // Safety checks
        if (!this.#canMove(node, targetNode)) {
            return node.id;
        }

        return targetNode.parent.children.insertAfter(targetNode, this.#detach(node), false).id;
    }

    /** Deletes a subtree given its root.
     * @public
     * @param {any} nodeId - The ID of the root of the subtree. 
     */
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
    constructor(data, id, parent) {
        super(data);
        this.id = id;
        this.parent = parent;
        this.children = new LinkedList();
    }
}