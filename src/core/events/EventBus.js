export class EventBus {
    #map;

    constructor() {
        this.#map = new Map();
    }

    publish(event, payload) {
        const eventMap = this.#map.get(event);
        if (!eventMap) return;
        for (const [key, handler] of eventMap) {
            try {
                handler(payload);
            } catch(err) {
                console.error('Handler Error:', err);
            }
        }
    }

    subscribe(event, handler) {
        let id = crypto.randomUUID();
        const map = this.#map;

        if (map.has(event)) {
            const eventMap = map.get(event);
            while (eventMap.has(id)) {
                id = crypto.randomUUID();
            }
            eventMap.set(id, handler);
        } else {
            const eventMap = new Map();
            map.set(event, eventMap);
            eventMap.set(id, handler);
        }
        
        return id;
    }

    unsubscribe(event, id) {
        const eventMap = this.#map.get(event);
        if (!eventMap) throw new Error('Failed to unsubscribe to event: event doesn\'t exist');
        eventMap.delete(id);
    }

    clearAll() {
        this.#map.clear();
    }
}