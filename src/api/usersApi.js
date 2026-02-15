import { noviFetch } from "./noviClient";

export function getUsers({ token } = {}) {
    return noviFetch("/api/users", { token });
}

export function deleteUser({ token, id, }) {
  return noviFetch(`/api/users/${id}`, {
    method: "DELETE",
    token,
  });
}