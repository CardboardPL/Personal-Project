import { ValidatorFunctions } from './Validator.js';

export class SchemaField {
    #locks = {
        dataType: {
            locked: false,
            associatedMethods: ['string', 'number', 'boolean', 'array', 'object'],
            incompatibleTypes: [],
        },
        string: {
            locked: false,
            associatedMethods: ['minLength', 'maxLength'],
            incompatibleTypes: ['dataType', 'number', 'boolean', 'array', 'object'],
        },
        number: {
            locked: false,
            associatedMethods: ['min', 'max'],
            incompatibleTypes: ['dataType', 'string', 'boolean', 'array', 'object'],
        },
        boolean: {
            locked: false,
            associatedMethods: [],
            incompatibleTypes: ['dataType', 'string', 'number', 'array', 'object'],
        },
        array: {
            locked: false,
            associatedMethods: [],
            incompatibleTypes: ['dataType', 'string', 'number', 'boolean', 'object'],
        },
        object: {
            locked: false,
            associatedMethods: [],
            incompatibleTypes: ['dataType', 'string', 'number', 'boolean', 'array'],
        }
    }
    #operationsMap = {
        stringMethods: [],
        numericalMethods: [],
        requiredParams: [false],
    };

    #lockMethod(methodName) {
        this[methodName] = () => { 
            throw new Error(`${methodName} can't be called at this stage.`);
        };
    }

    #lockIncompatibleTypes(validType) {
        for (const incompatibleType of this.#locks[validType].incompatibleTypes) {
            const pType = this.#locks[incompatibleType];
            pType.locked = true;

            // Lock associated methods
            for (const methodName of pType.associatedMethods) {
                this.#lockMethod(methodName);
            }
        }
    }

    #logResults(results, checkResult, key) {
        results.checks[key] = checkResult;
        if (results.status !== false && results.status !== checkResult.status) {
            results.status = checkResult.status;
        }
    }

    #pushMethod(location, methodName, value, func) {
        if (!Array.isArray(this.#operationsMap[location])) throw new Error('Invalid location.');
        this.#operationsMap[location].push({
            methodName,
            value,
            func
        });
    }

    #getValidMethodArray(dataType) {
        switch(dataType) {
            case 'number':
                return this.#operationsMap.numericalMethods;
            case 'string':
                return this.#operationsMap.stringMethods;
            default:
                throw new Error('Invalid data type');
        }
    }

    #assertLock(categoryName, errorMessage = 'Failed') {
        if (!this.#locks[categoryName].locked) {
            throw new Error(errorMessage);
        } 
    }

    #defineTypeSpecificMethod(name, category, assertName, assertMsg, value, func) {
        this.#assertLock(assertName, assertMsg);
        this.#pushMethod(category, name, value, func);
        this.#lockMethod(name);
    }

    // General Methods
    required(errorMessage = null, successMessage = null) {
        this.#operationsMap['requiredParams'] = [true, errorMessage, successMessage];
        this.#lockMethod('required');
        return this;
    }

    // Data Type Methods
    string(errorMessage = null, successMessage = null) {
        this.#operationsMap['dataTypeParams'] = ['string', errorMessage, successMessage];
        this.#lockIncompatibleTypes('string');
        return this;
    }

    number(errorMessage = null, successMessage = null) {
        this.#operationsMap['dataTypeParams'] = ['number', errorMessage, successMessage];
        this.#lockIncompatibleTypes('number');
        return this;
    }

    boolean(errorMessage = null, successMessage = null) {
        this.#operationsMap['dataTypeParams'] = ['boolean', errorMessage, successMessage];
        this.#lockIncompatibleTypes('boolean');
        return this;
    }

    array(errorMessage = null, successMessage = null) {
        this.#operationsMap['dataTypeParams'] = ['array', errorMessage, successMessage];
        this.#lockIncompatibleTypes('array');
        return this;
    }

    object(errorMessage = null, successMessage = null) {
        this.#operationsMap['dataTypeParams'] = ['object', errorMessage, successMessage];
        this.#lockIncompatibleTypes('object');
        return this;
    }

    // Numerical Methods
    integer(errorMessage = null, successMessage = null) {
        this.#defineTypeSpecificMethod(
            'integer',
            'numericalMethods',
            'dataType',
            'Failed: Define the data type before running type-specfic methods.',
            [errorMessage, successMessage],
            ValidatorFunctions.integer
        )
        return this;
    }

    min(value, errorMessage = null, successMessage = null) {
        this.#defineTypeSpecificMethod(
            'min',
            'numericalMethods',
            'dataType',
            'Failed: Define the data type before running type-specfic methods.',
            [value, errorMessage, successMessage],
            ValidatorFunctions.min
        )
        return this;
    }

    max(value, errorMessage = null, successMessage = null) {
        this.#defineTypeSpecificMethod(
            'max',
            'numericalMethods',
            'dataType',
            'Failed: Define the data type before running type-specfic methods.',
            [value, errorMessage, successMessage],
            ValidatorFunctions.max
        )
        return this;
    }

    // String methods
    minLength(value, errorMessage = null, successMessage = null) {
        this.#defineTypeSpecificMethod(
            'minLength',
            'stringMethods',
            'dataType',
            'Failed: Define the data type before running type-specfic methods.',
            [value, errorMessage, successMessage],
            ValidatorFunctions.minLength
        )
        return this;
    }

    maxLength(value, errorMessage = null, successMessage = null) {
        this.#defineTypeSpecificMethod(
            'maxLength',
            'stringMethods',
            'dataType',
            'Failed: Define the data type before running type-specfic methods.',
            [value, errorMessage, successMessage],
            ValidatorFunctions.maxLength
        )
        return this;
    }

    // Validation Method
    validate(
        data, 
        earlyExit = {
            req: true
        }
    ) {
        const opMap = this.#operationsMap;
        const results = {
            status: true,
            checks: {}
        }

        const reqParams = opMap['requiredParams'];
        const reqResults = ValidatorFunctions.required(data, ...reqParams);
        this.#logResults(
            results, 
            reqResults, 
            'required'
        );

        if (earlyExit.req && !reqResults.status) return results;

        const dataTypeParams = opMap.dataTypeParams;
        if (!dataTypeParams) throw new Error('Failed: Define the schemaField before running "validate".');

        // Handle Data Type Checks
        this.#logResults(results, ValidatorFunctions.dataType(data, ...dataTypeParams), 'dataType');

        // Run Data Type Specific Checks
        const validators = this.#getValidMethodArray(dataTypeParams[0]);
        for (const validator of validators) {
            this.#logResults(results, validator.func(data, ...validator.value), validator.methodName);
        }

        return results;
    }
}