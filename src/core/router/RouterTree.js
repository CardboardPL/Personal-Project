import { GenericTree } from './../tree/GenericTree.js';
import { NavigationError } from './../errors/NavigationError.js';

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

    #packageData(segmentName, data, isWildCardContainer) {
        return {
            segmentName,
            html: data.html,
            css: data.css,
            js: data.js,
            isWildCardContainer,
            map: new Map()
        }
    }

    #getSegmentNode(segments) {
        if (segments == null) return this.#tree.root;

        if (typeof segments !== 'string' && !Array.isArray(segments)) {
            throw new Error('Invalid argument: argument must either be an array of segments or a path.');
        }

        if (typeof segments === 'string') {
            segments = this.#normalizePath(segments).split('/');
        }

        let curr = this.#tree.root;
        for (const segment of segments) {
            if (!curr) {
                throw new NavigationError('SEGMENT_NOT_FOUND', 404, this.#getErrorConfig('NOT_FOUND'));
            };
            curr = curr.data.map.get(segment);
        }

        return curr;
    }

    appendSegment(parentPath, segmentName, data, isWildCardContainer) {
        if (typeof parentPath !== 'string') throw new Error('parentPath must be a string.');
        if (typeof segmentName !== 'string') throw new Error('segmentName must be a string.');
        if (typeof data !== 'object' || data == null) throw new Error('data must be an object.');
        
        segmentName = segmentName.trim();
        parentPath = parentPath.trim();
        const parentNode = this.#getSegmentNode(parentPath);

        if (parentNode !== this.#tree.root && segmentName === '') throw new Error('Cannot create a segment whose name is empty unless the parentNode is the root.');

        parentNode.data.map.set(
            segmentName, 
            this.#tree.appendChild(parentNode, this.#packageData(segmentName, data, isWildCardContainer))
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
        // Make this quiet
        const segmentNode = this.#getSegmentNode(path);
        if (!segmentNode || segmentNode === this.#tree.root) throw new Error('Invalid Path.');
        return {
            html: segmentNode.data.html,
            css: segmentNode.data.css,
            js: segmentNode.data.js
        };
    }
}