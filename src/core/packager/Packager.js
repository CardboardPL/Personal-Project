import { ValidationSchema } from "../utils/Validation/ValidationSchema";
import { Queue } from "../collection/Queue";

export class Packager {
    #signature;
    #schema;

    constructor(signature, schema) {
        this.#signature = signature;
        this.#schema = {
            validation: new ValidationSchema(schema),
            template: schema
        };
    }

    #validateShape(data) {
        const dataQueue = new Queue();
        const initialDataKeys = Object.keys(data);
        const initialTemplate = this.#schema.template;
        const initialTemplateKeys = Object.keys(initialTemplate);

        // Validate Lengths
        if (initialDataKeys.length !== initialTemplateKeys.length) throw new Error(`Data-Template Key Mismatch: Property counts do not match.`);

        // Populate dataQueue
        for (const key of initialDataKeys) {
            dataQueue.enqueue({
                key,
                reference: data,
                template: initialTemplate,
                templateKeys: initialTemplateKeys
            });
        }
        
        // Enforce shape
        for (const prop of dataQueue.consume()) {
            const key = prop.key;
            if (!prop.templateKeys.includes(key)) throw new Error(`Data-Template Key Mismatch: ${key} isn't a valid key in the template.`);

            const currVal = prop.reference[key];
            const correspondingTemplateValue = prop.template[key];
            const isCurrValPOJO = typeof currVal === 'object' && !Array.isArray(currVal);
            const isTemplateValPOJO = typeof correspondingTemplateValue === 'object' && !Array.isArray(correspondingTemplateValue);
            if (isCurrValPOJO !== isTemplateValPOJO) throw new Error(`Data-Template Type Mismatch: Current Value is ${isCurrValPOJO ? 'a POJO' : 'not a POJO'} while Template Value is ${isTemplateValPOJO ? 'a POJO' : 'not a POJO'}`);
            if (isCurrValPOJO) {
                const nestedDataKeys = Object.keys(currVal);
                const nestedTemplateKeys = Object.keys(correspondingTemplateValue);
                if (nestedDataKeys.length !== nestedTemplateKeys.length) throw new Error(`Data-Template Key Mismatch at ${key}: Expected ${nestedTemplateKeys.length} properties but found ${nestedDataKeys.length}.`);
                for (const nestedKey of nestedDataKeys) {
                    dataQueue.enqueue({
                        key: nestedKey,
                        reference: currVal,
                        template: correspondingTemplateValue,
                        templateKeys: nestedTemplateKeys
                    })
                }
            }
        }
    }

    package(data) {
        this.#validateShape(data);
        const results = this.#schema.validation.validate(data);
        if (!results.status) throw new Error('Invalid Data', {
            cause: results
        });
        return new Package(
            this.#signature, 
            data
        );
    }
}

class Package {
    #signature;

    constructor(signature, data) {
        this.#signature = signature;
        this.data = data;
    }

    getSignature() {
        return this.#signature;
    }
}