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

        window.addEventListener('popstate', (e) => {
            this.navigateTo(window.location.pathname, false, e.state);
        });

        this.navigateTo(window.location.pathname);
    }

    addSegment(parentPath, segmentName, data) {
        return this.#navTree.appendSegment(parentPath, segmentName, data);
    }

    getSegmentData(path) {
        return this.#navTree.getSegmentData(path);
    }

    removeSegment(path) {
       this.#navTree.removeSegment(path);
    }

    async navigateTo(path, addToHistory = false, entryData) {
        let data;
        
        try {
            data = this.getSegmentData(path);
        } catch(err) {
            data = err.details;
        }
        
        const { controller } = await import(data.js);
        const packagedData = { data: {
            html: data.html,
            css: data.css,
            context: data.context
        }, controller }
        
        if (addToHistory) {
            history.pushState(entryData, '', path);
        }

        this.#renderer.router.renderMain(packagedData, entryData);
    }
}