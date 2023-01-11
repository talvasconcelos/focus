<script>
  import Avatar from "./Avatar.svelte";
  export let content, time, pubkey, name;
</script>

<article>
  <header>
    <Avatar {pubkey} />
    <div class="detail">
      {#if name}
        <small>{name}</small>
      {:else}
        <small>{pubkey.slice(0, 5)}...{pubkey.slice(-5)}</small>
      {/if}
      <small>{time}</small>
    </div>
  </header>
  <div class="content">{content}</div>
</article>

<style>
  article {
    width: 85%;
    margin: calc(var(--block-spacing-vertical) / 3) 0;
  }
  header {
    display: flex;
    padding: 0.5rem;
  }
  .detail {
    display: flex;
    flex-flow: column nowrap;
    margin-left: 1rem;
  }
  .content {
    text-align: right;
  }
</style>
