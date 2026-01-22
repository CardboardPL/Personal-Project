class AppRenderer {
    #rootElem;
    
    constructor(rootElem) {
        this.#validateRootElem(rootElem);
        this.#rootElem = rootElem;
    }

    #validateRootElem(rootElem) {
        if (!(rootElem instanceof HTMLElement)) throw new Error('rootElem must be an HTML element.');
        
        const forbiddenTags = [
            // Doesn't make sense to render in these elements
            'HTML', 'HEAD',

            // Doesn't make sense to append HTML to a script or style tag
            'STYLE', 'SCRIPT',

            // Void tags can't have children
            'AREA', 'BASE', 'BR', 'COL', 'EMBED', 
            'HR', 'IMG', 'INPUT', 'LINK', 'META',
            'PARAM', 'SOURCE', 'TRACK', 'WBR'
        ]

        if (forbiddenTags.includes(rootElem.tagName)) throw new Error('The provided rootElem is a forbidden tag.');
    }

    renderContainer(template) {
        this.#rootElem.innerHTML = template;
    }
}