import { writable, derived, get } from 'svelte/store';

function cloneDeep(object) {
  return JSON.parse(JSON.stringify(object));
}

function assignDeep(object, value) {
  if (Array.isArray(object)) {
    return object.map((o) => assignDeep(o, value));
  }
  const copy = {};
  for (const key in object) {
    copy[key] =
      typeof object[key] === 'object' ? assignDeep(object[key], value) : value;
  }
  return copy;
}

function set(obj, path, value) {
  if (Object(obj) !== obj) return obj; // When obj is not an object
  // If not yet an array, get the keys from the string-path
  if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
  path.slice(0,-1).reduce((a, c, i) => // Iterate all of them except the last one
       Object(a[c]) === a[c] // Does the key exist and is its value an object?
           // Yes: then follow that path
           ? a[c]
           // No: create the key. Is the next key a potential array-index?
           : a[c] = Math.abs(path[i+1])>>0 === +path[i+1]
                 ? [] // Yes: assign a new array object
                 : {}, // No: assign a new plain object
       obj)[path[path.length-1]] = value; // Finally assign the value to the last key
  return obj;
}
const validators = {
  required: (value) => !!value,
  maxLength: (value, criteria) => value && value.length <= criteria,
  minLength: (value, criteria) => value && value.length >= criteria,
  pattern: (value, criteria) => value && criteria.test(value),
  validate: (value, criteria) => criteria(value) ? false : true,
};

export const createForm = (options) => {
  const defaultValues = options.defaultValues || {};
  const basicValidation = options.validate;

  const onSubmit = options.onSubmit;

  const getInitial = {
    values: () => cloneDeep(defaultValues),
    errors: () => assignDeep(defaultValues, ''),
  };

  const values = writable(getInitial.values());
  const errors = writable(getInitial.errors());

  const isSubmitting = writable(false);
  const isValidating = writable(false);

  const updateValue = (path, value) => {
    values.update((obj) => {
      set(obj, path, value);

      return obj;
    })
  };

  const validateField = (field, value) => {
    let isValid = true;

    if (basicValidation && basicValidation[field]) {
      isValidating.set(true);

      for (let key in basicValidation[field]) {
        const rule = basicValidation[field][key];
        let criteria;
        let message = '';

        if (typeof rule === 'object' && !(rule instanceof RegExp)) {
          criteria = rule.value;
          message = rule.message;
        } else if (typeof rule === 'function') {
          criteria = rule;
          message = rule(value);
        } else {
          criteria = rule;
          message = `'${field}' doesn't match '${key}' rule`;
        }
        isValid = validators[key](value, criteria);

        if (!isValid) {
          setError(field, message);
          break;
        }
        clearErrors(field);
      }

      isValidating.set(false);

      return isValid;
    }
  };

  const handleChange = (event) => {
    const element = event.target;
    const field = element.name || element.id;
    const value = (element.getAttribute && element.getAttribute('type') === 'checkbox') ? element.checked : element.value;

    updateValue(field, value);

    return validateField(field, value);
  };

  /**
   * Reset form values and errors to initial values.
   */
  const reset = () => {
    values.set(getInitial.values());
    errors.set(getInitial.errors());
  };

  /**
   * Manually set error message for given field.
   * @param {string} path - field path
   * @param {string} error - error message
   * @returns
   */
  function setError(path, error) {
    errors.update((obj) => {
      set(obj, path, error);

      return obj;
    });
  };

  /**
   *  Manually clean error for given field/fields.
   * @param {(string|string[])} field - field name or array of filds names
   * @returns
   */
  function clearErrors(field) {
    if (typeof field === 'string' && field.length > 0) {
      setError(field, '');
      return;
    }

    if (Array.isArray(field) && field.length > 0) {
      field.forEach((path) => {
        setError(path, '');
      });
    }
  };

  function submitForm(values) {
    return Promise.resolve()
      .then(() => errors.set(getInitial.errors()))
      .then(() => onSubmit(values))
      .finally(() => isSubmitting.set(false));
  }

  function handleSubmit(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    isSubmitting.set(true);

    return new Promise((resolve) => {
      values.subscribe(resolve)();
    }).then((values) => {
      if (basicValidation && Object.keys(basicValidation).length > 0) {
        return Promise.resolve()
          .then(() => Promise.resolve(Object.keys(basicValidation).map((key) => validateField(key, values[key])))
          .then((validationResult) => {
            if (validationResult.some((invalid) => !!invalid)) {
              submitForm(values);
            }
          }));
      }

      submitForm(values);
    });
  };

  return {
    handleChange,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    values,
    errors,
    isSubmitting,
    isValidating,
    formState: derived([
      values,
      errors,
      isSubmitting,
      isValidating,
    ], ([
      $values,
      $errors,
      $isSubmitting,
      $isValidating,
    ]) => ({
      values: $values,
      errors: $errors,
      isSubmitting: $isSubmitting,
      isValidating: $isValidating,
    })),
  };
};
