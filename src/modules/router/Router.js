import { RouterTree } from './RouterTree.js';
import { RouterRenderer } from './RouterRenderer.js';

export class Router {
    #navTree;
    #renderer;

    constructor(rootElem, rootHTML, fallbackHTML) {
        this.#navTree = new RouterTree(rootHTML);
        this.#renderer = new RouterRenderer(rootElem, this, fallbackHTML);
        this.navigateTo(window.location.pathname);

        window.addEventListener('popstate', (e) => {
            if (!e.state.called) {
                this.#renderer.renderPathMain(window.location.pathname);
            }
        });
    }

    addPath(segment, absParentNode, segmentHTML) {
        return  this.#navTree.addChildSegment(absParentNode, segmentHTML, segment); 
    }

    findSegmentNode(absPath) {
        return this.#navTree.findSegmentNode(absPath);
    }

    removePath(absPath) {
        return this.#navTree.removePath(absPath);
    }

    getNodeContent(node) {
        if (!node || !node.data || !node.data.data || !node.data.data.data) return null; 
        return node.data.data.data;
    }

    getSegmentHTML(absPath) {
        const node = this.findSegmentNode(absPath);
        const nodeContent = this.getNodeContent(node);
        return nodeContent ? 
            (nodeContent.data == null ? null : nodeContent.data) : 
            null;
    }

    navigateTo(absPath, data) {
        const renderResult = this.#renderer.renderPathMain(absPath);
        history.pushState(data, '', renderResult.absPath);
        window.dispatchEvent(new PopStateEvent('popstate', { state: { called: true, data } }));
    }
}