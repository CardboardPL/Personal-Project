export class RouterRenderer {
    #modules;

    constructor(modules) {
        this.#modules = modules;
    }

    renderMain(packagedData, entryData) {
        this.#modules.eventRegistry.clearAll();
        this.#modules.eventBus.clearAll();
        packagedData.controller(this.#modules, packagedData.data, entryData);
    }
}