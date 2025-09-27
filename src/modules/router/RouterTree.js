import { Node } from '../../data-structures/LinkedList.js';
import { Tree, TreeNode } from '../../data-structures/Tree.js';

export class RouterTree extends Tree {
    constructor(rootHTML) {
        const rootNode = new Node(null, null, {
            id: 0, data: new TreeNode(null, { data: rootHTML, segmentName: '' })
        });
        rootNode.data.data.map = new Map();
        super(rootNode);
    }

    insertParentAboveWithSegment(node, data, segmentName) {
        segmentName = segmentName.trim().toLowerCase();
        if (segmentName.includes('/')) throw new Error('Segment name must not have a "/"');
        if (!segmentName) throw new Error('Invalid segment name');

        const parentNode = node.data.data.parent;
        const newNodeId = super.insertParentAbove(node, { data, segmentName });

        if (parentNode) {
            const parentNodeData = parentNode.data.data;
            if (!parentNodeData.map) {
                parentNodeData.map = new Map();
            } else if (parentNodeData.map.has(segmentName)) {
                throw new Error('Passed an existing segment name in the current level');
            }

            parentNodeData.map.set(segmentName, super.retrieveNode(newNodeId));
        }

        return newNodeId;
    }

    addChildSegment(parent, data, segmentName) {
        segmentName = segmentName.trim().toLowerCase();
        if (segmentName.includes('/')) throw new Error('Segment name must not have a "/"');
        if (!segmentName) throw new Error('Invalid segment name');

        if (!parent) throw new Error('Passed a parent that doesn\'t exist');

        const parentData = parent.data.data;
        if (!parentData.map) {
            parentData.map = new Map();
        } else if (parentData.map.has(segmentName)) {
            throw new Error('Passed an existing segment name in the current level');
        }

        const newNodeId = super.appendChild(parent, { data, segmentName });
        const newNode = super.retrieveNode(newNodeId);

        parentData.map.set(segmentName, newNode);

        return newNodeId;
    }

    removePath(absPath) {
        const node = this.findSegmentNode(absPath);
        if (!node) throw new Error(`No node found for path: ${absPath}`);
        this.deleteSubtree(node.data.id);
    }

    findSegmentNode(absPath) {
        const absPathType = typeof absPath;
        if (absPathType !== 'string') throw new Error(`Passed an invalid data type. Expected "absPath" to be of type "string" but received a type of ${absPathType}`);
        if (absPath === '/' || absPath === '') return this.root;

        if (!this.root) return null;
        
        // Normalize Path
        absPath = absPath.trim();
        if (absPath[0] === '/') {
            absPath = absPath.substring(1);
        }
        if (absPath[absPath.length - 1] === '/') {
            absPath = absPath.substring(0, absPath.length - 1);
        }

        const segments = absPath.trim().split('/');
        let current = this.root;
        for (const segment of segments) {
            if (!segment) throw new Error('Invalid path. Path has duplicate slashes (/)');

            current = current.data.data.map.get(segment);

            if (!current) return null;
        }

        return current;
    }
}