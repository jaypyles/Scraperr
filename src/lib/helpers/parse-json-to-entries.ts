export const parseJsonToEntries = (json: string): [string, string][] | null => {
  try {
    const parsed = JSON.parse(json);

    if (Array.isArray(parsed)) {
      if (
        parsed.length > 0 &&
        Array.isArray(parsed[0]) &&
        parsed[0].length === 2 &&
        typeof parsed[0][0] === "string"
      ) {
        // Already array of [key, val] tuples
        // Just ensure values are strings
        return parsed.map(([k, v]) => [k, String(v)]);
      }

      // Array of objects
      const allEntries: [string, string][] = [];
      for (const item of parsed) {
        if (typeof item === "object" && item !== null) {
          allEntries.push(
            // @ts-ignore
            ...Object.entries(item).map(([k, v]) => [k, String(v)])
          );
        } else {
          return null;
        }
      }
      return allEntries.length > 0 ? allEntries : null;
    } else if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([k, v]) => [k, String(v)]);
    }
    return null;
  } catch {
    return null;
  }
};
