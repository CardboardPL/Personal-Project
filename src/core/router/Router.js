import { RouterTree } from './RouterTree.js';
import { RouterRenderer } from './RouterRenderer.js';
import { AppRenderer } from '../renderer/AppRenderer.js';
import { EventRegistry } from '../events/EventRegistry.js';
import { EventBus, EventBusEntry } from '../events/EventBus.js';

export class Router {
    #navTree;
    #routerRenderer;
    #modules;

    constructor(rootElem, systemEventBus, errorConfig) {
        if (!(systemEventBus instanceof EventBus)) throw new Error('Failed to initialize Router: systemEventBus must be an instance of EventBus');
        this.#modules = {
            appRenderer: new AppRenderer(rootElem, new EventBusEntry(systemEventBus, ['UI:Deleted'])),
            eventRegistry: new EventRegistry(systemEventBus, new EventBusEntry(systemEventBus, null, ['UI:Deleted'])),
            eventBus: new EventBus(),
        };
        this.#navTree = new RouterTree(errorConfig);
        this.#routerRenderer = new RouterRenderer(Object.freeze(this.#modules));

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

        this.#routerRenderer.renderMain(packagedData, entryData);
    }
}