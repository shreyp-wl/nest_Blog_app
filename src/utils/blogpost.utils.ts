import { v4 as uuid } from "uuid";

export function generateSlug(title: string, id?: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens

  const [uuidPart] = (id ?? uuid()).split("-"); // short & readable

  return `${slug}-${uuidPart}`;
}
