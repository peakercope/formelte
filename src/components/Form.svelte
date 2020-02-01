<script>
  import {onMount} from 'svelte';

  let form;
  let fields = [];

  onMount(() => {
    fields = Array.from(form.querySelectorAll('input, select, textarea'))
            .filter(elem => !!elem.name)
            .map(elem => ({path: elem.name}));

    console.log(fields);
  });

  function handleSubmit() {

  }
</script>

<form
        bind:this={form}
        on:submit|preventDefault={handleSubmit}
>
  <slot/>
</form>
