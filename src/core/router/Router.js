import { RouterTree } from './RouterTree.js';
import { RouterRenderer } from './RouterRenderer.js';

export class Router {
    #navTree;
    #renderer;

    constructor(errorConfig) {
        this.#navTree = new RouterTree(errorConfig);
    }

    addPath() {
        
    }

    findSegmentNode() {
        
    }

    removePath() {
       
    }

    getNodeContent() {
        
    }

    getSegmentHTML() {
        
    }

    navigateTo() {
        
    }
}