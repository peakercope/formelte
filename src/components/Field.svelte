<script>
  import { onMount } from 'svelte';
  export let as = 'input';
  export let name = '';

  onMount(() => {
    if (!name) {
      console.warn("Field must contain 'name' attribute for collecting its value");
    }
  });
</script>

{#if as === 'input'}
  <input {...$$props}/>
{:else if as === 'textarea'}
  <textarea {...$$props}></textarea>
{/if}
