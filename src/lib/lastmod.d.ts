export const DATASETS: string[];
export const PAGE_DATA: Record<string, string[]>;
export function datasetLastVerified(key: string): string;
export function pageSourceFile(pagePath: string): string;
export function pageDates(pagePath: string): { published: string; modified: string };
