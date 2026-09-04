// Ensures only one embedded media player (YouTube now, SoundCloud/etc. in
// future) plays at a time. Each player registers a pause() callback when it
// mounts, and calls notifyPlaying(id) the moment it actually starts playing
// — which pauses every other currently-registered player. Doesn't care what
// kind of player it is, just that it can be told to pause.

type PauseFn = () => void;

const players = new Map<string, PauseFn>();

export function registerPlayer(id: string, pause: PauseFn) {
  players.set(id, pause);
}

export function unregisterPlayer(id: string) {
  players.delete(id);
}

export function notifyPlaying(id: string) {
  for (const [otherId, pause] of players) {
    if (otherId !== id) pause();
  }
}
