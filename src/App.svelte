<script>
  import { createForm } from './module.js';
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
</script>

<form on:submit={handleSubmit}>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" on:change={handleChange} bind:value={$values.name} />
  {#if $errors.name}
    <p style="color: red;">{$errors.name}</p>
  {/if}
  <p style="display: flex;">{$values.name}</p>

  <label for="position">Position:</label>
  <select name="position" id="position" on:change={handleChange} bind:value={$values.position}>
    <option value="jun">Junior</option>
    <option value="mid">Middle</option>
    <option value="sen">Senior</option>
  </select>
  {#if $errors.position}
    <p style="color: red;">{$errors.position}</p>
  {/if}
  <p style="display: flex;">{$values.position}</p>

  <label for="subscribe">Want Subsription?</label>
  <input type="checkbox" id="subscribe" name="subscribe" on:change={handleChange} bind:checked={$values.subscribe} />
  <p>{#if $values.subscribe}with{:else}without{/if} subscription</p>

  <button type="submit">submit</button>
</form>
