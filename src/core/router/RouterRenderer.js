export class RouterRenderer {
    #modules;

    constructor(modules) {
        this.#modules = modules;
    }

    renderMain(data, entryData) {
        this.#modules.eventRegistry.clearAll();
        this.#modules.eventBus.clearAll();
        data.controller(this.#modules, data, entryData);
    }
}