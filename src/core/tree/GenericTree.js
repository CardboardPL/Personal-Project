import { LinkedList, Node } from "./../collection/LinkedList.js";

export class GenericTree {
    #useLinkedList;

    constructor(useLinkedList) {
        this.#useLinkedList = useLinkedList;
    }

    appendChild(parentNode, data) {
        if (!this.root) {
            this.root = new GenericTreeNode(null, data, this.#useLinkedList);
            return this.root;
        }

        if (!(parentNode instanceof GenericTreeNode)) throw new Error('Invalid parentNode: Must be a GenericTreeNode');

        const node = new GenericTreeNode(parentNode, data, this.#useLinkedList);
        if (!this.#useLinkedList) {
            parentNode.children.push(node);
        }
        return this.#useLinkedList ? parentNode.children.appendNode(new Node(node)) : node;
    }

    removeChild(parentNode, node) {
        if (!this.#useLinkedList) {
            parentNode.children = parentNode.children.filter((val) => val !== node);
        } else {
            parentNode.children.removeNode(node);
        }
        return this.#useLinkedList ? parentNode.children.size() : parentNode.children.length;
    }
}

class GenericTreeNode {
    constructor(parent, data, useLinkedList) {
        this.parent = parent;
        this.data = data;
        this.children = useLinkedList ? new LinkedList : [];
    }
}