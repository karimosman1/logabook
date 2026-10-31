export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm text-red-700">{message}</span>;
}

// Red outline for a field that has an error
export function invalidClass(message?: string) {
  return message ? " border-red-400 focus:border-red-500 focus:ring-red-200" : "";
}
