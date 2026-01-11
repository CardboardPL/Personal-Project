export class IdRegistry {
    #map;
    #enableIdGeneration;
    #idGenerator;
    #counter;
    
    constructor(enableIdGeneration = true, idGenerator) {
        this.#map = new Map();
        this.#enableIdGeneration = enableIdGeneration;
        this.#counter = 0;

        if (this.#enableIdGeneration) {
            if (idGenerator != null && typeof idGenerator !== 'function') throw new Error('Invalid idGenerator: it must either be undefined/null to use the default ID generator or a function for custom ID generators');
            this.#idGenerator = idGenerator || (() => this.#counter++);
        }
    }

    #generateId(id) {
        let mapId;

        if (this.#enableIdGeneration) {
            mapId = this.#idGenerator();
        } else if (typeof id === 'string') {
            mapId = id.trim();
            if (!mapId) throw new Error('Passed an empty ID.');
        } else if (typeof id === 'number') {
            if (!Number.isFinite(id) || Number.isNaN(id)) throw new Error('Numerical IDs cannot be infinity or NaN.');
            mapId = id;
        } else {
            throw new Error('Passed an invalid ID.');
        }

        if (this.#map.has(mapId)) throw new Error('Passed an existing id');

        return mapId;
    }

    setItem(id, data) {
        const mapId = this.#generateId(id);
        this.#map.set(mapId, data);
        return mapId;
    }

    getItem(id) {
        return this.#map.get(id);
    }

    removeItem(id) {
        this.#map.delete(id);
    }
}