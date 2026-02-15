import { noviFetch } from "./noviClient";

export function getUsers({ token } = {}) {
    return noviFetch("/api/users", { token });
}

export function patchUser({ token, id, patch }) {
  return noviFetch(`/api/users/${id}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}