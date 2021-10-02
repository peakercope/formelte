<script>
  import { createForm } from './module.js';
  const { values, handleChange, handleSubmit } = createForm({
    defaultValues: {
      name: '',
    },
    onSubmit: (values) => {
      console.log(values);
    }
  });

  console.log($values);
</script>


<form on:submit={handleSubmit}>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" on:change={handleChange} bind:value={$values.name} />
  <p>{$values.name}</p>

  <button type="submit">send</button>
</form>
