<script>
  import Avatar from "../components/Avatar.svelte";
  import Note from "../components/Post.svelte";
  import state from "../stores/state";
  import AddNote from "./AddNote.svelte";

  let loading = true;
  let sidebarOpen = false;

  $: notes = Array.from($state.homeFeedNotes.values()).sort(
    (a, b) => b.created_at - a.created_at
  );

  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };
</script>

<nav class="container-fluid header">
  <ul>
    <li>
      <div class="burger">
        <div on:click={toggleSidebar}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </li>
  </ul>
  <ul><li class="title">Focus</li></ul>
  <ul>
    <li>
      <Avatar pubkey={$state.keys.pub} />
    </li>
  </ul>
</nav>
<div class="layout">
  <div
    class="sidebar"
    class:open={sidebarOpen}
  >
    <div
      class="close"
      on:click={toggleSidebar}
    />
    sidebar
  </div>
  <section class="content">
    {#each notes as note}
      <Note {note} />
    {/each}
  </section>
  <AddNote />
</div>

<style>
  :root {
    --sidebar-width: 300px;
  }
  nav.header {
    z-index: 99;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: calc(var(--block-spacing-vertical) + 3.5rem);
    backdrop-filter: saturate(80%) blur(20px);
    background-color: var(--nav-background-color);
    box-shadow: 0 1px 0 var(--nav-border-color);
  }

  nav.header .title {
    text-transform: uppercase;
    font-weight: 700;
  }

  .burger {
    margin: 0;
    padding: var(--spacing);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .burger span {
    display: block;
    width: 22px;
    height: 3px;
    background-color: var(--color);
    margin: 4px auto;
  }

  .layout {
    display: block;
    padding-top: calc(var(--block-spacing-vertical) + 3.5rem);
  }

  .sidebar {
    background-color: var(--card-sectionning-background-color);
  }

  .content {
    padding: 0 var(--grid-spacing-horizontal);
  }

  .content > article {
    word-break: break-all;
  }

  @media only screen and (min-width: 768px) {
    /* grid */
    .layout {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr;
      grid-template-areas: "sidebar content";
      min-height: 100vh;
    }

    .sidebar {
      grid-area: sidebar;
      position: fixed;
      min-height: 100vh;
      width: var(--sidebar-width);
    }

    .content {
      grid-area: content;
    }

    .burger {
      display: none;
    }
  }

  @media only screen and (max-width: 767px) {
    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      min-height: 100vh;
      width: var(--sidebar-width);
      left: calc(-1 * var(--sidebar-width));
      transition: transform 0.3s cubic-bezier(0.25, 1, 0.25, 1);
      z-index: 100;
    }

    .close {
      position: absolute;
      right: 0;
      top: 0;
      margin: 0.75rem;
    }
    .close:after {
      display: inline-block;
      content: "\00d7";
      font-size: 2rem;
    }
    .open {
      transform: translateX(var(--sidebar-width));
    }
  }
</style>
