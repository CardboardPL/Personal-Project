class AppRenderer {
    #rootElem;
    
    constructor(rootElem) {
        // Add Checks for Root Elem
        this.#rootElem = rootElem;
    }

    renderContainer(template) {
        this.#rootElem.innerHTML = template;
    }
}