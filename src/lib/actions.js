import state from "../stores/state";
import { dbGetMetaEvent, dbSave } from "./db";
import { pool, signAsynchronously } from "./pool";
import { metadataFromEvent } from "./utils";

export function initKeys(keys) {
  state.setKeys(keys);
}

export async function launch(store) {
  // if we have already have a private key
  if (store.keys.priv) {
    pool.setPrivateKey(store.keys.priv);
  } else {
    pool.registerSigningFunction(signAsynchronously);
  }

  // our current stuff before loading events
  let { relays, following } = store;

  // load list of people we're following from kind3 event
  let contactList = await dbGetMetaEvent(3, store.keys.pub);

  if (contactList) {
    following = contactList.tags
      .filter(([t, v]) => t === "p" && v)
      .map(([_, v]) => v);
  }

  // load list of relays from kind10001 event
  let relayList = await dbGetMetaEvent(10001, store.keys.pub);
  if (relayList) {
    relays = relayList.tags
      .filter(([t, _, __]) => t.startsWith("ws://") || t.startsWith("wss://"))
      .filter((tag) => tag.length === 3);
  }
  // update store state
  state.updateFollowing(following);
  state.updateRelays(relays);

  // setup pool
  store.relays.forEach(([url, read, write]) => {
    pool.addRelay(url, { read: read === "", write: write === "" });
  });

  // preload our own profile from the db
  await useProfile(store, { pubkey: store.keys.pub });

  // start listening for nostr events
  restartMainSubscription(store);
}

let mainSub = pool;

export function restartMainSubscription(store) {
  mainSub = mainSub.sub(
    {
      skipVerification: true,
      filter: [
        // notes, profiles and contact lists from ourselves
        {
          kinds: [0, 1, 2, 3],
          authors: [store.keys.pub], //just us
          since: Math.round(Date.now() / 1000 - 60 * 60 * 24 * 90)
        },
        {
          kinds: [0],
          authors: [...store.following], // profiles from following
          since: Math.round(Date.now() / 1000 - 60 * 60 * 24 * 90)
        },

        // posts mentioning us
        {
          kinds: [1],
          "#p": [store.keys.pub],
          since: Math.round(Date.now() / 1000 - 60 * 60 * 24 * 90) //probably better from last stored note date
        },

        // our relays
        {
          kinds: [10001],
          authors: [store.keys.pub],
          since: Math.round(Date.now() / 1000 - 60 * 60 * 24 * 90)
        }
      ],
      cb: async (event, relay) => {
        switch (event.kind) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            break;
          case 3: {
            if (event.pubkey === store.keys.pub) {
              // we got a new contact list from ourselves
              // we must update our local relays and following lists
              // if we don't have any local lists yet
              let local = await dbGetMetaEvent(3, store.keys.pub);
              if (!local || local.created_at < event.created_at) {
                let relays, following;
                try {
                  relays = JSON.parse(event.content);
                  state.setRelays(relays);
                } catch (err) {
                  console.error(err);
                }

                following = event.tags
                  .filter(([t, v]) => t === "p" && v)
                  .map(([_, v]) => v);
                state.setFollowing(following);

                following.forEach((f) => useProfile(store, { pubkey: f }));
              }
            }
            break;
          }
          case 4:
            break;
        }
        addEvent(store, { event, relay });
      }
    },
    "main-channel"
  );
}

export function isReply(event) {
  let refs = event.tags.filter(([t, v]) => t === "e" && v);
  //if there's no "e" tags on event, is not a reply
  if (refs.length === 0) {
    return false;
  }
  let rootEventId;
  refs.some((t) => {
    let root = t.find((c) => c == "root");

    return (rootEventId = root ? t[1] : t[1]); //return the same for now, to account for NIP10 backwards comp.
  });
  //add as a reply to root event
  state.addToReplies(event, rootEventId);
  return true;
}

export async function addEvent(store, { event, relay = null }) {
  switch (event.kind) {
    case 0:
      await dbSave(event);
      await useProfile(store, { pubkey: event.pubkey });
      break;
    case 1:
      if (isReply(event)) return;
      let storedEvent = store.homeFeedNotes.has(event.id);
      if (storedEvent && storedEvent.created_at > event.id) return;
      state.addToHomeFeed(event);
      break;
    case 2:
      break;
    case 3:
      await dbSave(event);
      await useContacts(store, event.pubkey);
      break;
    case 4:
      break;
    case 10001:
      await dbSave(event);
      break;
  }
}

export async function useProfile(store, { pubkey, request = false }) {
  let metadata;

  if (store.profilesCache.has(pubkey)) {
    // we don't fetch again, but we do commit this so the LRU gets updated
    state.addProfileToCache({ pubkey, ...store.profilesCache.get(pubkey) });
    return;
  }

  // fetch from db and add to cache
  let event = await dbGetMetaEvent(0, pubkey);
  if (event) {
    metadata = metadataFromEvent(event);
  } else if (request) {
    // try to request from a relay
    await new Promise((resolve) => {
      let sub = pool.sub({
        filter: [{ authors: [pubkey], kinds: [0] }],
        cb: async (event) => {
          metadata = metadataFromEvent(event);
          clearTimeout(timeout);
          if (sub) sub.unsub();
          resolve();
        }
      });
      let timeout = setTimeout(() => {
        sub.unsub();
        sub = null;
        resolve();
      }, 2000);
    });
  }

  if (metadata) {
    state.addProfileToCache(metadata);

    // TODO NIP05
    // if (metadata.nip05) {
    //   if (metadata.nip05 === '') delete metadata.nip05

    //   let cached = store.state.nip05VerificationCache[metadata.nip05]
    //   if (cached && cached.when > Date.now() / 1000 - 60 * 60) {
    //     if (cached.pubkey !== pubkey) delete metadata.nip05
    //   } else {
    //     let checked = await queryName(metadata.nip05)
    //     store.commit('addToNIP05VerificationCache', {
    //       pubkey: checked,
    //       identifier: metadata.nip05
    //     })
    //     if (pubkey !== checked) delete metadata.nip05
    //   }

    //   store.commit('addProfileToCache', metadata)
    // }
  }
}

export async function useContacts(store, pubkey) {
  if (store.contactListCache.has(pubkey)) {
    // we don't fetch again, but we update state
    state.addContactListToCache(store.contactListCache.get(pubkey));
  } else {
    // fetch from db and add to cache
    let event = await dbGetMetaEvent(3, pubkey);
    if (event) {
      state.addContactListToCache(event);
    }
  }
}
