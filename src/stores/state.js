import { getPublicKey } from "nostr-tools";
import {
  generateSeedWords,
  privateKeyFromSeed,
  seedFromWords
} from "nostr-tools/nip06";
import { writable } from "svelte/store";
import { dbGetAllEvents } from "../lib/db";
import { metadataFromEvent } from "../lib/utils";

const isClientUsingTor = () => window.location.hostname.endsWith(".onion");

const getMainnetRelays = () => {
  const relays = [
    // ["wss://relay.damus.io", "", ""],
    ["wss://nostr-pub.wellorder.net", "", ""]
    // ["wss://nostr-verified.wellorder.net", "", "!"],
    // ["wss://expensive-relay.fiatjaf.com", "", "!"],
    // ["wss://relay.minds.com/nostr/v1/ws", "", "!"]
  ];
  const optional = [
    ["wss://nostr.rocks", "", ""],
    ["wss://nostr.onsats.org", "", ""],
    ["wss://nostr-relay.untethr.me", "", ""],
    ["wss://nostr-relay.wlvs.space", "", ""],
    ["wss://nostr.bitcoiner.social", "", ""],
    ["wss://nostr.openchain.fr", "", ""],
    ["wss://nostr.drss.io", "", ""]
  ];

  // for (let i = 0; i < 3; i++) {
  //   let pick = parseInt(Math.random() * optional.length);
  //   let [url, prefs] = optional[pick];
  //   relays[url] = prefs;
  //   optional.splice(pick, 1);
  // }

  return relays;
};

const getTorRelays = () => [
  "ws://jgqaglhautb4k6e6i2g34jakxiemqp6z4wynlirltuukgkft2xuglmqd.onion",
  "",
  ""
];

const relays = isClientUsingTor() ? getTorRelays() : getMainnetRelays();

const initialState = {
  keys: JSON.parse(localStorage.getItem("keys")) || {}, // {priv, pub },

  relays, // [url, read, write]
  following: [], // [ pubkeys... ]
  homeFeedNotes: new Map(),
  replies: new Map(), // { [event]: {event} }

  profilesCache: new Map(), // { [pubkey]: {name, about, picture, ...} }
  contactListCache: new Map(), // { [pubkey]: {name, about, picture, ...} }
  nip05VerificationCache: new Map() // { [identifier]: {pubkey, when }
};

const state = writable(initialState);

export default {
  subscribe: state.subscribe,
  update: state.update,
  setKeys({ mnemonic, priv, pub } = {}) {
    if (!mnemonic && !priv && !pub) {
      mnemonic = generateSeedWords();
    }

    if (mnemonic) {
      let seed = seedFromWords(mnemonic);
      priv = privateKeyFromSeed(seed);
    }

    if (priv) {
      pub = getPublicKey(priv);
    }

    state.update((state) => {
      state.keys = { priv, pub };
      return state;
    });
    localStorage.setItem("keys", JSON.stringify({ priv, pub }));
  },
  async initStore() {
    const [profilesCache, contactListCache] = await Promise.all([
      dbGetAllEvents(0),
      dbGetAllEvents(3)
    ]);
    profilesCache &&
      profilesCache.forEach((ev) => {
        this.addProfileToCache(metadataFromEvent(ev));
      });
    contactListCache &&
      contactListCache.forEach((ev) => {
        this.addContactListToCache(ev);
      });
    state.update((state) => {
      state.relays = relays;
      return state;
    });
    return;
  },
  setFollowing(following) {
    state.update((state) => {
      state.following = following;
      return state;
    });
  },
  updateFollowing(pubkeys) {
    if (!pubkeys) return;
    state.update((state) => {
      let newList = new Set([...state.following, ...pubkeys]);
      state.following = [...newList];
      return state;
    });
  },
  setRelays(relays) {
    state.update((state) => {
      state.relays = relays;
      return state;
    });
  },
  updateRelays(relays) {
    if (!relays) return;
    state.update((state) => {
      state.relays = [...state.relays, ...relays];
      return state;
    });
  },
  addProfileToCache({ pubkey, name, about, picture, nip05 }) {
    state.update((state) => {
      state.profilesCache.set(pubkey, { name, about, picture, nip05 });
      return state;
    });
  },
  addContactListToCache(event) {
    state.update((state) => {
      state.contactListCache.set(event.pubkey, event);
      return state;
    });
  },
  addToHomeFeed(event) {
    state.update((state) => {
      state.homeFeedNotes.set(event.id, event);
      return state;
    });
  },
  addToReplies(event, root) {
    state.update((state) => {
      let replies = state.replies.get(root) || [];
      state.replies.set(root, [...replies, event]);
      return state;
    });
  }
};
