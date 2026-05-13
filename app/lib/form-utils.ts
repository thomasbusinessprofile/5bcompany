export function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function validateEmail(email: string) {
  return /^[^\s@]{2,}@[^\s@]{3,}\.[a-zA-Z]{2,}$/.test(email);
}
