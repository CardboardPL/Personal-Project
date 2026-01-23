import { AppRenderer } from './../renderer/AppRenderer.js';

export class RouterRenderer {
    #appRenderer;

    constructor(appRenderer) {
        if (!(appRenderer instanceof AppRenderer)) throw new Error('Invalid');
        this.#appRenderer = appRenderer;
    }

    renderMain(data) {
        this.#appRenderer.renderContainer(data.html);
    }

    renderElement(data, element) {
        
    }
}