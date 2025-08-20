export class UIComponents {
    constructor(components) {
        this.components = {
            '/404': new UIComponent('/404', 'Page Not Found', ``)
        };
        for (const component of components) {
            this.components[component.route] = component;
        }
    }

    getHTML(component) {
        return component.html;
    }

    getComponentElement(route) {
        return document.querySelector(`[data-component="${route}"]`);
    }

    async getComponent(route) {
        return this.components[route] ||this.components['/404'];
    }

    async htmlLoader(route, elementId) {
        const component = await this.getComponent(route)
        document.title = component.title;
        document.getElementById(elementId).innerHTML = this.getHTML(component);
    }
}

export class UIComponent {
    constructor(route, title, html) {
        this.route = route;
        this.title = title;
        this.html = html;
    }
}

export class Modal {
    static className = 'Modal';
    #data;
    #modalElem;

    constructor(modalElem, associatedButtons = [], eventListenerRegistry = null) {
        this.#modalElem = modalElem;
        this.isOpen = false;
        this.associatedButtons = associatedButtons;
        this.eventListenerRegistry = eventListenerRegistry;
    }

    attachData(data) {
        this.#data = data;
    }

    retrieveData() {
        return this.#data;
    }

    retrieveModalElem() {
        return this.#modalElem;
    }

    showModal() {
        if (!this.isOpen) {
            const modalElem = this.#modalElem;

            modalElem.classList.add('visible');
            modalElem.classList.remove('hidden');

            if (modalElem.getAttribute('aria-hidden') === 'true') {
                this.isOpen = true;
                modalElem.setAttribute('aria-hidden', 'false');
            }
        }
        
    }

    hideModal() {
        if (this.isOpen) {
            const modalElem = this.#modalElem;

            modalElem.classList.add('hidden');
            modalElem.classList.remove('visible');

            if (modalElem.getAttribute('aria-hidden') === 'false') {
                this.isOpen = false;

                const eventListenerRegistry = this.eventListenerRegistry;
                if (eventListenerRegistry) {
                    for (const associatedButton of this.associatedButtons) {
                        eventListenerRegistry.removeEventHandler(associatedButton.id, associatedButton.event);
                    }
                }

                modalElem.setAttribute('aria-hidden', 'true');

                [...modalElem.querySelectorAll('input, textarea')].forEach(elem => elem.value = '');
            }
        }
    }

    getClassName() {
        return Modal.className;
    }
}