import { writable, derived } from 'svelte/store';

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


export const createForm = (options) => {
  const defaultValues = options.defaultValues || {};

  const onSubmit = options.onSubmit;

  const getInitial = {
    values: () => cloneDeep(defaultValues),
    errors: () => assignDeep(defaultValues, ''),
    touched: () => assignDeep(defaultValues, false)
  }

  const values = writable(getInitial.values());
  const errors = writable(getInitial.errors());
  const touched = writable(getInitial.touched());

  const isSubmitting = writable(false);

  const updateValue = (path, value) => {
    values.update((obj) => {
      set(obj, path, value);

      return obj;
    })
  };

  const handleChange = (event) => {
    const element = event.target;
    const field = element.name || element.id;
    const value = (element.getAttribute && element.getAttribute('type') === 'checkbox') ? element.checked : element.value;

    return updateValue(field, value);
  };

  const handleSubmit = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    isSubmitting.set(true);

    return new Promise((resolve) => {
      values.subscribe(resolve)();
    }).then((values) => {
      return Promise.resolve()
        .then(() => onSubmit(values))
        .finally(() => isSubmitting.set(false));
    });
  }

  return {
    handleChange,
    handleSubmit,
    values,
    errors,
    touched,
    isSubmitting,
    state: derived([
      values,
      errors,
      touched,
      isSubmitting,
    ], ([
      $values,
      $errors,
      $touched,
      $isSubmitting,
    ]) => ({
      values: $values,
      errors: $errors,
      touched: $touched,
      isSubmitting: $isSubmitting,
    })),
  };
};
