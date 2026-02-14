import { noviFetch } from "./noviClient";

export function getWorkoutExercises({ token } = {}) {
  return noviFetch("/api/workoutExercises", { token });
}

export function createWorkoutExercise({ token, item }) {
  return noviFetch("/api/workoutExercises", {
    method: "POST",
    token,
    body: item,
  });
}

export function patchWorkoutExercise({ token, id, patch }) {
  return noviFetch(`/api/workoutExercises/${id}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}

export function deleteWorkoutExercise({ token, id }) {
  return noviFetch(`/api/workoutExercises/${id}`, {
    method: "DELETE",
    token,
  });
}