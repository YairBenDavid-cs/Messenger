
export function interpolate(template: string, vars: Record<string, string> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = vars[key];
    if (value === undefined) {
      throw new Error(`Missing prompt variable: ${key}`);
    }
    return value;
  });
}
