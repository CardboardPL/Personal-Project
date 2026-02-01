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

    #packageData(segmentName, data, wildCardInfo) {
        return {
            segmentName,
            html: data.html,
            css: data.css,
            js: data.js,
            wildCardInfo: {
                isContainer: wildCardInfo.isContainer,
                valueName: wildCardInfo.valueName,
                valueType: wildCardInfo.valueType
            },
            map: new Map()
        }
    }

    #getPathData(segments) {
        if (segments == null) return this.#tree.root;

        if (typeof segments !== 'string' && !Array.isArray(segments)) {
            return null;
        }

        if (typeof segments === 'string') {
            segments = this.#normalizePath(segments).split('/');
        }
        
        let curr = this.#tree.root;
        const resultObj = { node: curr, context: {} };
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const wildCardInfo = curr.data.wildCardInfo;
            if (wildCardInfo.isContainer) {
                if (wildCardInfo.valueType === 'path') {
                    const pathSegments = segments.splice(i);
                    const params = pathSegments[pathSegments.length - 1].split('?');
                    pathSegments[pathSegments.length - 1] = params[0];
                    resultObj.context[wildCardInfo.valueName] = {
                        value: pathSegments.join('/'),
                        paramStr: params[1] || ''
                    };
                    return resultObj;
                } else {
                    const params = segment.split('?');
                    resultObj.context[wildCardInfo.valueName] = {
                        value: params[0],
                        paramStr: params[1]
                    };
                }
                continue;
            }
            if (!curr) {
                throw new NavigationError('SEGMENT_NOT_FOUND', 404, this.#getErrorConfig('NOT_FOUND'));
            };
            curr = curr.data.map.get(segment);
            resultObj.node = curr;
        }

        return resultObj;
    }

    appendSegment(parentPath, segmentName, data, wildCardInfo) {
        if (typeof parentPath !== 'string') throw new Error('parentPath must be a string.');
        if (typeof segmentName !== 'string') throw new Error('segmentName must be a string.');
        if (typeof data !== 'object' || Array.isArray(data) || data == null ) throw new Error('data must be a plain object.');
        if (typeof wildCardInfo !== 'object' || Array.isArray(wildCardInfo) || wildCardInfo == null) throw new Error('wildCardInfo must be a plain object.');
        
        segmentName = segmentName.trim();
        parentPath = parentPath.trim();
        const parentNode = this.#getPathData(parentPath).node;

        if (parentNode !== this.#tree.root && segmentName === '') throw new Error('Cannot create a segment whose name is empty unless the parentNode is the root.');

        parentNode.data.map.set(
            segmentName, 
            this.#tree.appendChild(parentNode, this.#packageData(segmentName, data, wildCardInfo))
        );

        const separator = parentPath && parentPath[parentPath.length - 1] === '/' ? '' : '/';
        return (parentPath == null ? '' : parentPath) + separator + segmentName.replace('/', '');
    }

    removeSegment(path) {
        const node = this.#getPathData(path).node;
        if (!node) throw new Error('Invalid path.');
        if (!node.parent) throw new Error('Cannot remove the root.');
        node.parent.data.map.delete(node.data.segmentName);
    }

    getSegmentData(path) {
        const pathData = this.#getPathData(path);
        const segmentNode = pathData.node;
        if (!segmentNode || segmentNode === this.#tree.root) throw new Error('Invalid Path.');
        return {
            html: segmentNode.data.html,
            css: segmentNode.data.css,
            js: segmentNode.data.js,
            context: pathData.context
        };
    }
}