// Helper for smoke tests to confirm that expected exports are present and
// not null/undefined. The smoke tests own their own `errors` array — we
// take it as an argument rather than relying on a free `errors` global
// (which ESLint correctly flagged as `no-undef`).
export function check(errors, name, value) {
  if (value == null) {
    errors.push(`${name} is ${value}`);
  }
}