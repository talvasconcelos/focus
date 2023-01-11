import { createStore, set, values } from "idb-keyval";

const nostrDB = createStore("nostr", "events");

export const dbGetAllEvents = async (kind) => {
  try {
    let events = await values(nostrDB);
    events = events.filter((evt) => evt.kind === kind);
    return events && events.length ? events : null;
  } catch (error) {
    return null;
  }
};

export const dbGetMetaEvent = async (kind, pubkey) => {
  try {
    let events = await values(nostrDB);
    events = events.filter((evt) => evt.kind === kind && evt.pubkey === pubkey);
    return events && events.length ? events[0] : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const dbSave = async (event) => {
  try {
    // const events = await entries(nostrDB)
    if (
      event.kind === 0 ||
      event.kind === 3 ||
      (event.kind >= 10000 && event.kind < 20000)
    ) {
      //is replaceable
      let previous = await dbGetMetaEvent(event.kind, event.pubkey);
      // if this is replaceable and not the newest, abort here
      if (previous && previous.created_at > event.created_at) {
        return;
      }
      // update existing entry
      set(event.id, event, nostrDB);
      return;
    }
  } catch (error) {
    console.error(error);
  }
};
