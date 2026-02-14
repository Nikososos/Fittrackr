import { noviFetch } from "./noviClient";

export function getWorkoutCompletions({ token, userId } = {}) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return noviFetch(`/api/workoutCompletions${qs}`, { token });
}

export function createWorkoutCompletion({ token, completion }) {
  return noviFetch("/api/workoutCompletions", {
    method: "POST",
    token,
    body: completion,
  });
}