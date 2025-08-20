export class EventHandlerRegistry {
    #eventHandlers;
    #eventsToBeHandledArr;

    constructor(eventsToBeHandledArr = [], initialEventHandlerArr = [], stopPropagation = true) {
        this.#eventHandlers = new Map(initialEventHandlerArr);
        this.#initializeGlobalListener(eventsToBeHandledArr);
        this.#eventsToBeHandledArr = eventsToBeHandledArr;
        this.stopPropagation = stopPropagation;
    }

    #checkArgumentValidity(argsTypePairs) {
        for (const [arg, expectedType] of argsTypePairs) {
            const actualType = typeof arg;
            if (actualType !== expectedType) {
                const argDisplay = actualType === 'object' ? JSON.stringify(arg) : arg;
                throw new TypeError(`Invalid Argument: Expected "${expectedType}", but got "${actualType}" (${argDisplay})`);
            }
        }
    }

    #initializeGlobalListener(events) {
        events.forEach(event => document.addEventListener(event, this.#handleGlobalListener));
    }

    #handleGlobalListener = (e) => {
        if (this.stopPropagation) e.stopPropagation();
        if (this.#eventHandlers.size === 0) return;

        let currentElem = e.target;
        let isFound = false;

        while (currentElem && !isFound) {
            for (const [selector, eventMap] of this.#eventHandlers) {
                if (currentElem.matches(selector)) {
                    const handler = this.retrieveEventHandlerFunction(selector, e.type, false);
                    
                    if (handler) {
                        handler(e);
                        isFound = true;
                    }
                    
                }
            } 

            currentElem = currentElem.parentElement;
        }
    }

    hasEventHandler(selector, event) {
        const eventHandler = this.#eventHandlers.get(selector);
        return eventHandler && eventHandler.get(event);
    }

    retrieveEventHandlerFunction(selector, event, strict = true) {
        this.#checkArgumentValidity([[selector, 'string'], [event, 'string']]);

        const eventHandler = this.#eventHandlers.get(selector);
        if (!eventHandler) {
            if (strict) throw new Error(`No event handler found for selector: "${selector}"`);
            return null;
        }

        const eventHandlerFunction = eventHandler.get(event);
        if (!eventHandlerFunction && strict) {
            throw new Error(`No event handler function found for selector: "${selector}", and event: ${event}`);
        }

        return eventHandlerFunction || null;
    }

    retrieveAllEventHandlers() {
        return this.#eventHandlers;
    }

    addEventHandler(selector, func, event) {
        this.#checkArgumentValidity([[selector, 'string'], [func, 'function'], [event, 'string']]);

        if (!this.#eventHandlers.has(selector)) {
            this.#eventHandlers.set(selector, new Map());
        }

        const eventHandlerMap = this.#eventHandlers.get(selector);
        if (eventHandlerMap.has(event)) {
            throw new Error(`Event handler with selector: "${selector}", and an event: ${event}, has already been registered`);
        }

        eventHandlerMap.set(event, func);
    }

    updateEventHandler(selector, func, event) {
        this.#checkArgumentValidity([[selector, 'string'], [func, 'function'], [event, 'string']]);

        if (!this.#eventHandlers.has(selector)) {
            throw new Error(`No event handler found for selector: "${selector}"`);
        }

        this.#eventHandlers.get(selector).set(event, func);
    }

    removeEventHandler(selector, event) {
        this.#checkArgumentValidity([[selector, 'string'], [event, 'string']]);

        const eventHandlerMap = this.#eventHandlers.get(selector);
        if (!eventHandlerMap) {
            throw new Error(`No event handler found for selector: ${selector}`);
        }

        if (!eventHandlerMap.get(event)) {
            throw new Error(`No event function found for selector: ${selector}, and event: ${event}`);
        }

        eventHandlerMap.delete(event);
        
        if (eventHandlerMap.size === 0) {
            this.#eventHandlers.delete(selector);
        }
    }

    removeAllEventHandlers(selector) {
        const eventHandlerMap = this.#eventHandlers.get(selector);
        if (!eventHandlerMap) {
            throw new Error(`No event handler found for selector: ${selector}`);
        }

        this.#eventHandlers.delete(selector);
    }

    getPresentEvents() {
        const presentEvents = new Set();

        for (const [selector, eventMap] of this.#eventHandlers) {
            for (const [event, func] of eventMap) {
                presentEvents.add(event);
            }
        }

        return [...presentEvents.keys()];
    }

    close() {
        this.#eventHandlers.clear();
        this.#eventHandlers = null;
        this.#eventsToBeHandledArr.forEach(event => document.removeEventListener(event, this.#handleGlobalListener));

        Object.defineProperty(this, 'closed', { value: true });

        for (const key of Object.getOwnPropertyNames(EventHandlerRegistry.prototype)) {
            if (typeof this[key] === 'function' && key !== 'constructor') {
                this[key] = () => {
                    throw new Error('Cannot use EventHandlerRegistry after calling "close()"');
                };
            }
        }
    }
}