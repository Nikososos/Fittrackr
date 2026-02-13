import { noviFetch } from "./noviClient";

export function getUsers({ token } = {}) {
    return noviFetch("/api/users", { token });
}