// Helper for smoke tests to confirm that expected exports are present and not null/undefined.
export function check(name, value) {
  if (value == null) {
    errors.push(`${name} is ${value}`);
  }
}