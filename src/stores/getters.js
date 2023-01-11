import { derived } from "svelte/store";
import state from "./state";

export const profiles = derived(state, ($state) => {
  const profiles = $state.profilesCache;
  return profiles;
});
