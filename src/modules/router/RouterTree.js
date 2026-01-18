import { GenericTree } from './../../core/tree/GenericTree.js';
import { NavigationError } from '../../core/errors/NavigationError.js';

export class RouterTree {
    #tree;
    #errorConfig;

    constructor(errorConfig) {
        this.#tree = new GenericTree(true);
        this.#tree.appendChild(null, this.#packageData('root', {
            html: null,
            css: null,
            js: null
        }));

        if (typeof errorConfig === 'object') {
            this.#errorConfig = errorConfig;
        } 
    }

    #getErrorConfig(key) {
        if (!this.#errorConfig) return null;
        return this.#errorConfig[key] || null;
    }

    #normalizePath(path) {
        let str = '';
        
        for (let i = 0; i < path.length; i++) {
            const char = path[i];
            if ((i === 0 || i === path.length - 1) && char === '/') continue;
            str += char;
        }

        return str;
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
        if (path == null) return this.#tree.root;
        const segments = this.#normalizePath(path).split('/');
        

        let curr = this.#tree.root;
        for (const segment of segments) {
            if (!curr) {
                throw new NavigationError('SEGMENT_NOT_FOUND', 404, this.#getErrorConfig('NOT_FOUND'));
            };
            curr = curr.data.map.get(segment);
        }

        return curr;
    }

    appendSegment(parentPath, segmentName, data) {
        const parentNode = this.#getSegmentNode(parentPath);

        parentNode.data.map.set(
            segmentName, 
            this.#tree.appendChild(parentNode, this.#packageData(segmentName, data))
        );

        const separator = parentPath && parentPath[parentPath.length - 1] === '/' ? '' : '/';
        return (parentPath == null ? '' : parentPath) + separator + segmentName.replace('/', '');
    }

    removeSegment(path) {
        const node = this.#getSegmentNode(path);
        if (!node) throw new Error('Invalid path.');
        if (!node.parent) throw new Error('Cannot remove the root.');
        node.parent.data.map.delete(node.data.segmentName);
    }

    getSegmentData(path) {
        const segmentNode = this.#getSegmentNode(path);
        if (!segmentNode) throw new Error('Invalid Path.');
        const { html, css, js } = segmentNode.data;
        return { html, css, js };
    }
}