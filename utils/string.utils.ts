// Utility function to capitalize the first letter of a string
export const toCapitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Utility function for sentence casing (capitalize first letter of each sentence)
export const toSentenceCase = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
};

// Utility function for camel casing (e.g., "hello world" => "helloWorld")
export const toCamelCase = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    })
    .replace(/\s+/g, ""); // Removes spaces
};

// Utility function for full small case (e.g., "Hello World" => "helloworld")
export const toFullSmallCase = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, () => "")
    .replace(/\s+/g, ""); // Removes spaces
};

// Utility function for snake casing (e.g., "Hello World" => "hello_world")
export const toSnakeCase = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str.toLowerCase().replace(/\s+/g, "_"); // Replaces spaces with underscores
};

// Utility function for kebab casing (e.g., "Hello World" => "hello-world")
export const toKebabCase = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str.toLowerCase().replace(/\s+/g, "-"); // Replaces spaces with dashes
};

// Utility function for title casing (e.g., "hello world" => "Hello World")
export const toTitleCase = (str: string): string => {
  if (!str) return "";
  str = str.trim();
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => toCapitalizeFirstLetter(word))
    .join(" ");
};

export function removeSpaces(input: string): string {
  return input.replace(/\s+/g, "");
}
