function createValidationResult(status, errorMessage = 'Failed', successMessage = 'Success') {
    return {
        status,
        message: status ? 
            successMessage :
            errorMessage
    };
}

export const ValidatorFunctions = {
    required: (data, isRequired, errorMessage, successMessage) => {
        const isValid = !isRequired || (data != null && data !== '');
        return createValidationResult(
            isValid, 
            errorMessage || 'Failed: Expected a value.', 
            successMessage || 'Success'
        );
    },

    dataType: (val, type, errorMessage, successMessage) => {
        const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
        if (!validTypes.includes(type)) throw new Error('Invalid Data Type');

        const typeofVal = typeof val;
        let isValid = typeofVal === type;

        if (type === 'array') {
            isValid = Array.isArray(val);
            typeofVal = isValid ? 'array' : typeofVal;
        }

        if (val === null) {
            typeofVal = 'null';
            isValid = type === 'object' ? false : isValid;
        }

        return createValidationResult(
            isValid, 
            errorMessage || `Failed: Expected a ${type} but received a ${typeofVal}.`, 
            successMessage || 'Success'
        );
    },
    
    // Number specific functions
    integer: (val, errorMessage, successMessage) => {
        const isValid = Number.isInteger(val);
        return createValidationResult(
            isValid, 
            errorMessage || `Failed: Expected an integer but received ${val}.`, 
            successMessage || 'Success'
        );
    },

    min: (val, minVal, errorMessage, successMessage) => {
        const isValid  = val >= minVal;
        return createValidationResult(
            isValid, 
            errorMessage || `Failed: Expected a value greater than or equal to ${minVal} but received ${val}.`, 
            successMessage || 'Success'
        );
    },

    max: (val, maxVal, errorMessage, successMessage) => {
        const isValid = val <= maxVal;
        return createValidationResult(
            isValid, 
            errorMessage || `Failed: Expected a value less than or equal to ${maxVal} but received ${val}.`, 
            successMessage || 'Success'
        );
    },

    // String specific functions
    minLength: (val, minLength, errorMessage, successMessage) => {
        const isValid = val != null ? val.length >= minLength : false;
        return createValidationResult(
            isValid, 
            errorMessage || `Failed expected a length greater than or equal to ${minLength} but received ${val.length}.`,
            successMessage || 'Success'
        );
    },

    maxLength: (val, maxLength, errorMessage, successMessage) => {
        const isValid = val != null ? val.length <= maxLength : false;
        return createValidationResult(
            isValid, 
            errorMessage || `Failed expected a length less than or equal to ${maxLength} but received ${val.length}.`,
            successMessage || 'Success'
        );
    }
}