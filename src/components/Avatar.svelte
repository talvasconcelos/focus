<script>
  import { profiles } from "../stores/getters";

  export let pubkey;

  const getPicture = (pubkey) => {
    if (!$profiles.has(pubkey) || !$profiles.get(pubkey)?.picture)
      return "/img/avatar-default.png";
    return $profiles.get(pubkey).picture;
  };

  $: picture = getPicture(pubkey);
</script>

<figure style={`background-image: url(${picture})`}>
  <img
    src={picture}
    alt="avatar"
  />
</figure>

<style>
  figure {
    margin: 0;
    width: 50px;
    height: 50px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 50%;
  }
  img {
    display: none;
  }
</style>
