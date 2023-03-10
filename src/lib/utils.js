export default function timeFromNow(time) {
  // Get timestamps
  let unixTime = new Date(time).getTime();
  if (!unixTime) return;
  let now = new Date().getTime();

  // Calculate difference
  let difference = unixTime / 1000 - now / 1000;

  // Setup return object
  let tfn = {};

  // Check if time is in the past, present, or future
  tfn.when = "now";
  if (difference > 0) {
    tfn.when = "future";
  } else if (difference < -1) {
    tfn.when = "past";
  }

  // Convert difference to absolute
  difference = Math.abs(difference);

  // Calculate time unit
  if (difference / (60 * 60 * 24 * 365) > 1) {
    // Years
    tfn.unitOfTime = "years";
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 365));
  } else if (difference / (60 * 60 * 24 * 45) > 1) {
    // Months
    tfn.unitOfTime = "months";
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 45));
  } else if (difference / (60 * 60 * 24) > 1) {
    // Days
    tfn.unitOfTime = "days";
    tfn.time = Math.floor(difference / (60 * 60 * 24));
  } else if (difference / (60 * 60) > 1) {
    // Hours
    tfn.unitOfTime = "hours";
    tfn.time = Math.floor(difference / (60 * 60));
  } else if (difference / 60 > 1) {
    // Minutes
    tfn.unitOfTime = "minutes";
    tfn.time = Math.floor(difference / 60);
  } else {
    // Seconds
    tfn.unitOfTime = "seconds";
    tfn.time = Math.floor(difference);
  }

  // Return time from now data
  return tfn;
}

export const emptyMetadata = () => ({
  name: null,
  about: null,
  picture: null,
  domain: null
});

export function metadataFromEvent(event) {
  try {
    let metadata = JSON.parse(event.content);
    metadata.pubkey = event.pubkey;
    return metadata;
  } catch (_) {
    return {};
  }
}
