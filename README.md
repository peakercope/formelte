# formelte

Form state management librarary for svelte.

## Installation

```
TBD
```

## Example of usage

```JS
import { createForm } from 'formelte';

const { values, errors, handleChange, handleSubmit } = createForm({
  defaultValues: {
    name: '',
    position: '',
    subscribe: true,
  },
  onSubmit: (values) => {
    console.log(values);
  }
});

<form on:submit={handleSubmit}>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" on:change={handleChange} bind:value={$values.name} />
  {#if $errors.name}
    <p style="color: red;">{$errors.name}</p>
  {/if}

  <label for="position">Position:</label>
  <select name="position" id="position" on:change={handleChange} bind:value={$values.position}>
    <option value="jun">Junior</option>
    <option value="mid">Middle</option>
    <option value="sen">Senior</option>
  </select>
  {#if $errors.position}
    <p style="color: red;">{$errors.position}</p>
  {/if}

  <label for="subscribe">Want Subsription?</label>
  <input type="checkbox" id="subscribe" name="subscribe" on:change={handleChange} bind:checked={$values.subscribe} />

  <button type="submit">submit</button>
</form>

```
