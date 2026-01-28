import { RouterTree } from './RouterTree.js';
import { RouterRenderer } from './RouterRenderer.js';

export class Router {
    #navTree;
    #renderer;

    constructor(appRenderer, errorConfig) {
        this.#renderer = {
            router: new RouterRenderer(appRenderer),
            app: appRenderer
        };
        this.#navTree = new RouterTree(errorConfig);
    }

    addSegment(parentPath, segmentName, data) {
        return this.#navTree.appendSegment(parentPath, segmentName, data);
    }

    getSegmentData() {
        
    }

    removeSegment(path) {
       this.#navTree.removeSegment(path);
    }

    navigateTo() {
        
    }
}