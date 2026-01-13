import { GenericTree } from './../../core/tree/GenericTree.js';

export class RouterTree {
    #tree;

    constructor() {
        this.#tree = new GenericTree(true);
    }

    #packageData(segmentName, data) {
        return {
            segmentName,
            html: data.html,
            css: data.css,
            js: data.js,
            map: new Map()
        }
    }

    #getSegmentNode(path) {
        const segments = path.split('/');
        if (!this.#tree.root) throw new Error('Invalid path.'); // Throw 404 or smth

        let curr = this.#tree.root;
        for (const segment of segments) {
            if (!curr) throw new Error('Invalid path.'); // Throw 404 or smth
            curr = curr.map.get(segment);
        }

        return curr;
    }

    appendSegment(parentPath, segmentName, data) {
        const parentNode = this.#getSegmentNode(parentPath);

        this.#tree.appendChild(parentNode, this.#packageData(segmentName, data));

        const separator = parentPath[parentPath.length - 1] === '/' ? '' : '/';
        return parentPath + separator + segmentName.replace('/', '');
    }

    removeSegment(parentPath, segmentName) {

    }

    getSegmentData(path) {
        const segmentNode = this.#getSegmentNode(path);
        if (!segmentNode) throw new Error('Invalid Path.');
        const { html, css, js } = segmentNode.data;
        return { html, css, js };
    }
}