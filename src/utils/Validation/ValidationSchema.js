import { Queue } from './../../data-structures/Queue.js';
import { Node } from './../../data-structures/LinkedList.js';
import { SchemaField } from './SchemaField.js';

export class ValidationSchema {
    #schema;

    constructor(schema, lockedSchema = false) {
        // Validate Arguments
        if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
            throw new Error('Invalid Argument: A schema must be a plain object.');
        }

        if (typeof lockedSchema !== 'boolean') {
            throw new Error('Invalid Argument: lockedSchema must be a boolean');
        }

        this.#schema = {
            data: schema,
            locked: lockedSchema
        };

        this.#validateSchema(this.#schema.data);
    }

    #validateSchema(schema) {
        const schemaList = new Queue().enqueue(schema);

        while (schemaList.queueSize()) {
            const currSchema = schemaList.dequeue();
            for (const key in currSchema) {
                const currValue = currSchema[key];
                const isSchemaField = currValue instanceof SchemaField;
                const isValidationSchema = currValue instanceof ValidationSchema;
                const isPlainObject = currValue && typeof currValue === 'object' && !Array.isArray(currValue);

                if (!isSchemaField && !isValidationSchema && !isPlainObject) {
                    throw new Error('Invalid Schema: Schema Values must be a ValidationSchema, SchemaField, or a plain object.');
                }

                if (isPlainObject) {
                    schemaList.enqueue(currValue);
                }
            }
        }
    }
}