<script>
  function handleSubmit() {

  }
</script>

<form
  on:submit|preventDefault={handleSubmit}
>
  <slot />
</form>
