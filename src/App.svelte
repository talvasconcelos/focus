<script>
  import { generatePrivateKey } from "nostr-tools";
  import { validateWords } from "nostr-tools/nip06";
  import { onMount } from "svelte";
  import Home from "./components/Home.svelte";
  import { launch } from "./lib/actions";
  import state from "./stores/state";

  let inputKey;
  let initializeKeys = true;
  let hasExtension = false;
  let watchOnly = false;
  let key = null;

  $: isKey = key?.toLowerCase()?.match(/^[0-9a-f]{64}$/);

  $: isKeyValid = isKey || validateWords(key?.toLowerCase());

  // $: isKeyValid = () => {
  //   if (isKey) return true;
  //   if (validateWords(key?.toLowerCase())) return true;
  //   return false;
  // };

  function generate() {
    key = generatePrivateKey();
    watchOnly = false;
  }

  async function getFromExtension() {
    try {
      key = await window.nostr.getPublicKey();
      watchOnly = true;
    } catch (err) {
      console.error(
        `Failed to get a public key from a Nostr extension: ${err}`
      );
    }
  }

  async function proceed() {
    let lkey = key?.toLowerCase();
    var keys = {};
    if (validateWords(lkey)) {
      keys.mnemonic = lkey;
    } else if (isKey) {
      if (watchOnly) keys.pub = key;
      else keys.priv = key;
    } else {
      console.warn("Proceed called with invalid key", key);
    }
    state.setKeys(keys);
    await state.initStore();
    await launch($state);
    initializeKeys = false;
  }

  onMount(async () => {
    if ($state.keys.pub) {
      await state.initStore();
      launch($state);
      initializeKeys = false;
    } else {
      // keys not set up, offer the option to try to get a pubkey from window.nostr
      setTimeout(() => {
        if (window.nostr) {
          hasExtension = true;
        }
      }, 1000);
    }
  });
</script>

<!-- <svelte:window on:load={checkNostr} /> -->
<main>
  {#if initializeKeys}
    <dialog open={initializeKeys}>
      <article>
        <h3>Initial Key Setup</h3>
        <p>
          Type your private key from a previous Nostr account or generate a new
          one.
        </p>
        <p>
          You can also type just a public key and later sign events manually or
          using a Nostr-capable browser extension.
        </p>
        <br />
        <fieldset>
          <legend>Key</legend>
          <label>
            <input
              bind:this={inputKey}
              type="text"
              placeholder="Private key or public key"
              bind:value={key}
              required
            />
          </label>

          <label>
            <input
              type="checkbox"
              bind:checked={watchOnly}
              disabled={!isKey}
            />
            This is a public key
          </label>
        </fieldset>
        <footer>
          {#if !isKeyValid}
            <a
              href="#"
              role="button"
              class="secondary"
              on:click={generate}
            >
              Generate
            </a>
            {#if hasExtension}
              <a
                href="#"
                role="button"
                class="secondary"
                on:click={getFromExtension}
              >
                Use Public Key from Extension
              </a>
            {/if}
          {:else}
            <a
              href="#"
              role="button"
              on:click={proceed}
            >
              Proceed
            </a>
          {/if}
        </footer>
      </article>
    </dialog>
  {:else}
    <Home />
  {/if}
</main>
