import { noviFetch } from "./noviClient";

export function getWorkoutExercises({ token } = {}) {
  return noviFetch("/api/workout_exercises", { token });
}

export function createWorkoutExercise({ token, item }) {
  return noviFetch("/api/workout_exercises", {
    method: "POST",
    token,
    body: item,
  });
}

export function patchWorkoutExercise({ token, id, patch }) {
  return noviFetch(`/api/workout_exercises/${id}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}

export function deleteWorkoutExercise({ token, id }) {
  return noviFetch(`/api/workout_exercises/${id}`, {
    method: "DELETE",
    token,
  });
}