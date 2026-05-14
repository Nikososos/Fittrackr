import { noviFetch } from "./noviClient";

export function loginRequest({ email, password }) {
    return noviFetch("/api/login", {
        method: "POST",
        body: { email, password },
    });
}

export function registerRequest ({ email, password }) {
    return noviFetch("/api/register", {
        method: "POST",
        body: { email, password},
    });
}