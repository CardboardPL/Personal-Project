export class AppRenderer {
    #rootElem;
    #systemEventBus;
    
    constructor(rootElem, systemEventBus) {
        this.#validateRootElem(rootElem);
        this.#rootElem = rootElem;
        this.#systemEventBus = systemEventBus;

        this.#systemEventBus.subscribe('UI:ListenerCleanupResponse', (payload) => {
            const [ listenerCleanupResponse, elem ] = payload;
            if (listenerCleanupResponse) {
                const orphanedElements = [];
                for (const child of elem.children) {
                    orphanedElements.push(child);
                }

                this.#systemEventBus.publish('UI:ListenerCleanup', orphanedElements);
            }
        });
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

    #publishOverwrittenChildren(elem) {
        this.#systemEventBus.publish('UI:RequestListenerCleanup', elem);
        this.#systemEventBus.publish('UI:Overwritten', null);
    }

    #mountTemplate(elem, template, pos) {
        if (!elem) throw new Error('The element passed must be a valid HTML element.');

        this.#validateTemplate(template);
        elem.insertAdjacentHTML(pos, template);
    }

    renderContainer(template) {
        this.#validateTemplate(template);
        this.#publishOverwrittenChildren(this.#rootElem);
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

    overwriteTemplateInMain(selector, template) {
        if (typeof selector !== 'string') throw new Error(`Failed to overwrite element content: expected selector to be a string but received ${typeof selector}`);
        this.#validateTemplate(template);
        const elemToBeOverwritten = this.#rootElem.querySelector(selector);
        if (!elemToBeOverwritten) throw new Error('Failed to overwrite element: element doesn\'t exist');
        this.#publishOverwrittenChildren(elemToBeOverwritten);
        elemToBeOverwritten.innerHTML = template;
    }

    deleteElement(selector) {
        if (typeof selector !== 'string') throw new Error(`Failed to delete element: expected selector to be a string but received ${typeof selector}`);
        const elemToBeDeleted = this.#rootElem.querySelector(selector);
        if (elemToBeDeleted) {
            elemToBeDeleted.remove();
            this.#systemEventBus.publish('UI:Deleted', elemToBeDeleted);
        }
    }
}