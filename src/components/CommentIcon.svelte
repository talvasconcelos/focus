<script>
  export let active;
</script>

<div
  class="icon-button"
  aria-label="Icon-only Button"
>
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 24 24"
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    class="icon-button__icon"
    aria-hidden="true"
    focusable="false"
    ><path
      class="cls-1"
      class:disabled={!active}
      d="M1.5,5.3v9.54a3.82,3.82,0,0,0,3.82,3.82H7.23v2.86L13,18.66h5.73a3.82,3.82,0,0,0,3.82-3.82V5.3a3.82,3.82,0,0,0-3.82-3.82H5.32A3.82,3.82,0,0,0,1.5,5.3Z"
    /><line
      class="cls-1"
      class:disabled={!active}
      x1="15.82"
      y1="10.07"
      x2="17.73"
      y2="10.07"
    /><line
      class="cls-1"
      class:disabled={!active}
      x1="11.05"
      y1="10.07"
      x2="12.95"
      y2="10.07"
    /><line
      class="cls-1"
      class:disabled={!active}
      x1="6.27"
      y1="10.07"
      x2="8.18"
      y2="10.07"
    /></svg
  >
</div>

<style>
  .cls-1 {
    fill: none;
    stroke: var(--primary);
    stroke-miterlimit: 10;
    stroke-width: 1.91px;
  }
  .disabled {
    stroke: var(--secondary);
  }
  .icon-button {
    width: 2rem;
    height: 2rem;
    padding: 0.35em;
  }
  .icon-button__icon {
    width: 100%;
    height: 100%;
    fill: none;
  }
</style>
