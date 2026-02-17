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

export class EventBusEntry {
    #eventBus;
    #allowedBroadcasts;
    #allowedSubscriptions;

    constructor(eventBus, allowedBroadcasts, allowedSubscriptions) {
        if (!(eventBus instanceof EventBus)) throw new Error('Failed to create an EventBusEntry: eventBus must be an instance of EventBus');
        if (!Array.isArray(allowedBroadcasts) && allowedBroadcasts != null) throw new Error('Failed to create an EventBusEntry: allowedEvents must be an array when given');
        if (!Array.isArray(allowedSubscriptions) && allowedSubscriptions != null) throw new Error('Failed to create an EventBusEntry: allowedEvents must be an array when given');
        this.#eventBus = eventBus;
        this.#allowedBroadcasts = new Set(allowedBroadcasts ? allowedBroadcasts : []);
        this.#allowedSubscriptions = new Set(allowedSubscriptions ? allowedSubscriptions : []);
    }

    publish(event, payload) {
        if (!this.#allowedBroadcasts.has(event)) throw new Error('Failed to publish event: illegal event');
        this.#eventBus.publish(event, payload);
    }

    subscribe(event, handler) {
        if (!this.#allowedSubscriptions.has(event)) throw new Error('Failed to subscribe to event: illegal event');
        this.#eventBus.subscribe(event, handler);
    }

    unsubscribe(event, id) {
        if (!this.#allowedSubscriptions.has(event)) throw new Error('Failed to unsubscribe to event: illegal event');
        this.#eventBus.unsubscribe(event, id);
    }
}