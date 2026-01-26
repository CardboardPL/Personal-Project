export class AppRenderer {
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

    #validateTemplate(template) {
        if (typeof template !== 'string') throw new Error('Template must be of type string.');
    }

    #mountTemplate(elem, template, pos) {
        if (!elem) throw new Error('The element passed must be a valid HTML element.');

        this.#validateTemplate(template);
        elem.insertAdjacentHTML(pos, template);
    }

    renderContainer(template) {
        this.#validateTemplate(template);
        this.#rootElem.innerHTML = template;
    }

    appendTemplate(template) {
        this.#mountTemplate(this.#rootElem, template, 'beforeend');
    }

    appendTemplateInMain(selector, template) {
        this.#mountTemplate(this.#rootElem.querySelector(selector), template, 'beforeend');
    }

    appendTemplateBefore(selector, template) {
        this.#mountTemplate(this.#rootElem.querySelector(selector), template, 'beforebegin');
    }

    appendTemplateAfter(selector, template) {
        this.#mountTemplate(this.#rootElem.querySelector(selector), template, 'afterend');
    }
}