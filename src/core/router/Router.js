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