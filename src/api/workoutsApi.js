import { noviFetch } from "./noviClient";

export function getWorkouts({ token, userId } = {}) {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return noviFetch(`/api/workouts${qs}`, { token });
}

export function createWorkout({ token, workout }) {
    return noviFetch("/api/workouts", {
        method: "POST",
        token,
        body: workout,
    });
}

export function patchWorkout({ token, id, patch }) {
    return noviFetch(`/api/workouts/${id}`, {
        method: "PATCH",
        token,
        body: patch,
    });
}

export function deleteWorkout ({ token, id }) {
    return noviFetch(`/api/workouts/${id}`, {
        method: "DELETE",
        token,
    });
}