import { Queue } from './../../data-structures/Queue.js';
import { Node } from './../../data-structures/LinkedList.js';
import { SchemaField } from './SchemaField.js';

export class ValidationSchema {
    #schema;
    #connectedSchemas = new Set();

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

    #checkForCircularReferences(startRef) {
        const set = new Set();

        const queue = new Queue().enqueue(new Node(null, null, startRef));

        while (queue.queueSize()) {
            const currVal = queue.dequeue().data;

            if (set.has(currVal)) {
                throw new Error('Invalid Schema: Circular references detected.');
            }

            if (currVal instanceof ValidationSchema) {
                for (const schema of [...currVal.getConnectedSchemas()]) {
                    queue.enqueue(new Node(null, null, schema));
                }
            }
        }
    }

    #validateSchema(schema) {
        const schemaList = new Queue().enqueue(new Node(null, null, {
            depth: 0,
            schema: new Node(null, null, schema)
        }));
        while (schemaList.queueSize()) {
            const currSchemaData = schemaList.dequeue().data;
            const [currSchemaDepth, currSchema] = [currSchema.depth, currSchemaData.schema];
            this.#connectedSchemas.add(currSchema);

            for (const key in currSchema) {
                const currValue = currSchema[key];
                const isSchemaField = currValue instanceof SchemaField;
                const isValidationSchema = currValue instanceof ValidationSchema;
                const isPlainObject = currValue && typeof currValue === 'object' && !Array.isArray(currValue);

                if (this.#connectedSchemas.has(currValue)) {
                    throw new Error('Invalid Schema: Circular references detected.');
                }

                if (!isSchemaField && !isValidationSchema && !isPlainObject) {
                    throw new Error('Invalid Schema: Schema Values must be a ValidationSchema, SchemaField, or a plain object.');
                }

                if (isPlainObject) {
                    if (currSchemaDepth > 1000) {
                        throw new Error(`Invalid Schema: Reached maximum schema depth of ${currSchemaDepth}.`);
                    }

                    schemaList.enqueue(new Node({
                        depth: currSchemaDepth + 1,
                        schema: currValue
                    }));
                }
            }
        }

        this.#checkForCircularReferences(this);
    }

    #validateObject(schema, schemaData, breakOnFailure) {
        const results = {
            status: true,
            fieldChecks: {}
        };

        function decideResultsStatus(resultStatus) {
            if (results.status && !resultStatus) {
                results.status = false;
            }
        }

        for (const key in schema) {
            const curr = schema[key];
            const value = schemaData[key];

            const isSchemaField = curr instanceof SchemaField;
            const isValidationSchema = curr instanceof ValidationSchema;
            if (isSchemaField || isValidationSchema) {
                const result = curr.validate(value);

                if (isSchemaField) {
                    results.fieldChecks[key] = result;
                } else {
                    results.fieldChecks[key] = result.fieldChecks;
                }
                
                decideResultsStatus(result.status);
            } else {
                const result = this.#validateObject(schema[key], value, breakOnFailure);
                results.fieldChecks[key] = result.fieldChecks;
                decideResultsStatus(result.status);
            }

            if (breakOnFailure && !results.status) {
                return results;
            }
        }

        return results;
    }

    getConnectedSchemas() {
        return this.#connectedSchemas;
    }

    validate(schemaData, breakOnFailure = false) {
        return this.#validateObject(this.#schema.data, schemaData, breakOnFailure);
    }
}