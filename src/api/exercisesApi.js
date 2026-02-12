import { noviFetch } from "./noviClient";

export function getExercises({ token } = {}) {
    return noviFetch("/api/exercises", { token });
}

export function createExercise({ token, exercise }) {
    return noviFetch("/api/exercises", {
        method: "POST",
        token,
        body: exercise,
    });
}

export function updateExcercise( { token, id, patch }) {
    return noviFetch(`/api/exercises/${id}`, {
        method: "PATCH",
        token,
        body: patch,
    });
}

export function deleteExercise({ token, id }) {
    return noviFetch(`/api/exercises/${id}`, {
        method: "DELETE",
        token,
    });
}