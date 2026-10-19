import type { Locale } from "./config";
import { en } from "./en";
import { ar } from "./ar";

const dictionaries = { en, ar };

export const getDictionary = (locale: Locale) => dictionaries[locale];
export type { Dictionary } from "./en";
