import { Queue } from "../collection/Queue.js";

export class EventRegistry {
    #listeners;
    #validEvents = [
        'click'
    ];

    constructor(eventBus) {
        this.#listeners = new Map();
        eventBus.subscribe('UI:Deleted', (parent) => {
            const queue = new Queue().enqueue(parent);

            for (const elem of queue.consume()) {
                if (this.#listeners.has(elem)) this.#listeners.delete(elem);
                
                for (const child of elem.children) {
                    queue.enqueue(child);
                }
            }
        });
    }

    addEventListener(element, event, handler) {
        // Check if the passed arguments are valid
        if (!(element instanceof HTMLElement)) throw new Error('Failed to Add Event Listener: element must be an instance of HTMLElement');
        if (typeof event !== 'string' || !this.#validEvents.includes(event)) throw new Error('Failed to Add Event Listener: invalid event');
        if (typeof handler !== 'function') throw new Error('Failed to Add Event Listener: handler must be a function');

        // Register Event Listener
        if (this.#listeners.has(element)) {
            const elementMap = this.#listeners.get(element);
            if (elementMap.has(event)) throw new Error('Failed to Add Event Listener: cannot add a handler to an existing event of an element');
            elementMap.set(event, handler);
        } else {
            const elementMap = new Map();
            this.#listeners.set(element, elementMap);
            elementMap.set(event, handler);
        }

        // Add Event Listener
        element.addEventListener(event, handler);
    }

    removeEventListener(element, event) {
        // Check if the passed arguments are valid
        if (!(element instanceof HTMLElement)) throw new Error('Failed to Remove Event Listener: element must be an instance of HTMLElement');
        if (typeof event !== 'string' || !this.#validEvents.includes(event)) throw new Error('Failed to Remove Event Listener: invalid event');
        if (!this.#listeners.has(element)) throw new Error('Failed to Remove Event Listener: must be an existing element');

        const elementMap = this.#listeners.get(element);
        if (!elementMap.has(event)) throw new Error('Failed to Remove Event Listener: must be a registered event');

        // Remove Event Listener
        const handler = elementMap.get(event);
        elementMap.delete(event);
        element.removeEventListener(event, handler);

        // Remove element entry if it's empty
        if (elementMap.size === 0) {
            this.#listeners.delete(element);
        }
    }

    clearAll() {
        for (const [element, eventMap] of this.#listeners) {
            for (const [event, handler] of eventMap) {
                element.removeEventListener(event, handler);
            }
        }

        this.#listeners.clear();
    }
}