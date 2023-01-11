<script>
  import timeFromNow from "../lib/utils";
  import { profiles } from "../stores/getters";
  import state from "../stores/state";
  import Avatar from "./Avatar.svelte";
  import CommentIcon from "./CommentIcon.svelte";
  import Reply from "./Reply.svelte";

  export let note;
  let replyBox = false;

  const timeString = (timestamp) => {
    const tfn = timeFromNow(timestamp);
    return `${tfn.time} ${tfn.unitOfTime} ago`;
  };

  const toggleComments = (e) => {
    e.preventDefault();
    replyBox = !replyBox;
  };

  const getName = (pubkey) => {
    if (!$profiles.has(pubkey) || !$profiles.get(pubkey)?.name) return false;
    return $profiles.get(pubkey).name;
  };

  $: name = getName(note.pubkey);

  $: replies = $state.replies.has(note.id)
    ? Array.from($state.replies.get(note.id))
    : [];
</script>

<article>
  <header>
    <Avatar pubkey={note.pubkey} />
    <div class="detail">
      {#if name}
        <small>{name}</small>
      {:else}
        <small>{note.pubkey.slice(0, 5)}...{note.pubkey.slice(-5)}</small>
      {/if}
      <small>{timeString(note.created_at * 1000)}</small>
    </div>
    <div class="float-left">more</div>
  </header>
  <div class="content">
    {note.content}
  </div>
  {#if replyBox}
    <div class="replies">
      {#each replies as reply}
        <Reply
          content={reply.content}
          time={timeString(reply.created_at * 1000)}
          pubkey={reply.pubkey}
          name={getName(reply.pubkey)}
        />
      {/each}
    </div>
  {/if}
  <footer>
    <div
      on:click={replies.length ? toggleComments : null}
      class="reply_btn"
    >
      <CommentIcon active={replies.length} />
      {#if replies.length}
        <span class="count">{replies.length}</span>
      {/if}
    </div>
    <div class="float-left">share</div>
  </footer>
</article>

<style>
  article {
    margin: 0;
    margin-bottom: inherit;
    word-break: break-all;
  }

  .replies {
    display: flex;
    flex-direction: column;
    align-items: end;
    margin-top: var(--block-spacing-vertical);
  }

  header {
    display: flex;
  }

  footer {
    display: flex;
  }

  .reply_btn {
    cursor: pointer;
    display: flex;
    align-items: baseline;
    font-size: 0.85rem;
  }

  .detail {
    display: flex;
    flex-flow: column nowrap;
    margin-left: 1rem;
  }

  .float-left {
    margin-left: auto;
  }
</style>
