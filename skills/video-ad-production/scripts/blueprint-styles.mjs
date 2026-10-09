// Blueprint id → its FB- treatment token in the export filename.
//
// The vocabulary itself is the workspace grammar's (naming.json, mediums.video)
// and the naming tool that applies it lives in the shared `ad-naming` skill;
// this map is the one piece that is the video engine's own knowledge — which
// blueprint produces which treatment — and the blueprint lint holds every
// live blueprint to it so a blueprint and its filename cannot drift apart.

export const BLUEPRINT_STYLES = {
  "background-video-text-overlay": "videotextoverlay",
  "clapping-reaction": "videoreaction",
  "ugc-testimonial": "videotestimonial",
  "before-after": "beforeandafter",
};
