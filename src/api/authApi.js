import { noviFetch } from "./noviClient";

export function loginRequest({email, password}) {
    return noviFetch("/api/login", {
        method: "POST",
        body: { email, password},
    });
}