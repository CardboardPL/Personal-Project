import { Queue } from './../../data-structures/Queue.js';
import { Node } from './../../data-structures/LinkedList.js';
import { SchemaField } from './SchemaField.js';

export class ValidationSchema {
    #lockMapSchema;
    #schema;

    constructor(schema) {
        // Ensure that the schema is a plain object
        if (schema == null || 
            typeof schema !== 'object' || 
            Object.getPrototypeOf(schema) !== Object.prototype
        ) throw new Error('Invalid Schema: Schema must be a plain object.');

        // Ensure that the schema is not empty
        let run = false;
        for (const key in schema) {
            run = true;

            // Ensure that the value of the properties of the schema is either an instance of SchemaField or ValidationSchema
            const isValidationSchema = schema[key] instanceof ValidationSchema;     
            if (!(schema[key] instanceof SchemaField) && !isValidationSchema) {
                throw new Error(`Invalid Schema: Invalid Field at ${key}`);
            }

            if (isValidationSchema) {
                schema[key].lockMapSchema();
            }
        }
        if (!run) throw new Error('Invalid Schema: Schema must not be empty.');

        this.#lockMapSchema = false;
        this.#schema = Object.freeze(this.#lockMapSchema ? schema : this.#mapSchema(schema));
    }

    // Flattens the schema
    #mapSchema(schema) {
        const newSchema = {};
        const queue = new Queue();
        queue.enqueue(new Node(null, null, { schema, key: '' }));

        while (queue.queueSize()) {
            const data = queue.dequeue().data;
            const schema = data.schema;
            const prevKeyName = data.key.trim();

            for (const key in schema) {
                const newKeyName = prevKeyName ?  `${prevKeyName}.${key}` : key;

                if (schema[key] instanceof ValidationSchema) {
                    queue.enqueue(new Node(null, null, { schema: schema[key].getSchema(), key: newKeyName }));
                } else {
                    newSchema[newKeyName] = Object.freeze(schema[key]);
                    Object.freeze(schema[key].operationsMap);
                }
            }
        }

        return newSchema;
    }

    lockMapSchema() {
        this.#lockMapSchema = true;
    }

    getSchema() {
        return this.#schema;
    }

    getField(fieldName) {
        return this.#schema[fieldName];
    }

    validate(schemaData) {
        const schemaResults = { status: true, results: {} };

        // Process each SchemaField
        for (const fieldName in this.#schema) {
            const schemaField = this.#schema[fieldName];
            const data = schemaData[fieldName]; 
            
            const { status, messages } = schemaField.validate(data);
            schemaResults.results[fieldName] = { status, messages };
            schemaResults.status = schemaResults.status === false ? schemaResults.status : status;
        }

        return schemaResults;
    }
}