import { Router } from './Router.js';

export class RouterRenderer {
    #main;
    #router;
    #fallbackHTML;

    constructor(main, router, fallbackHTML) {
        if (!(router instanceof Router)) throw new Error('Aborted RouterRenderer Setup: "router" must be an instance of "Router"');
        if (!(main instanceof HTMLElement)) throw new Error('Aborted RouterRenderer Setup: "main" must be an instance of "HTMLElement"');

        this.#main = main;
        this.#router = router;
        this.#fallbackHTML = fallbackHTML;
    }

    renderPathMain(absPath) {
        const segmentHTML = this.#router.getSegmentHTML(absPath);

        if (!segmentHTML) {
            this.#main.innerHTML = this.#fallbackHTML;
            return { absPath: '404', segmentHTML: this.#fallbackHTML };
        }
        
        this.#main.innerHTML = segmentHTML;
        return { absPath, segmentHTML };
    }

    renderPathElement(absPath, element) {
        element.innerHTML = this.#router.getSegmentHTML(absPath);
    }
}