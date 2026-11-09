export const DATASETS: string[];
export const PAGE_DATA: Record<string, string[]>;
export const PAGE_SOURCE: Record<string, string[]>;
export const SCHEDULED: Record<string, unknown>;
export function datasetLastVerified(key: string): string;
export function pageSourceFile(pagePath: string): string;
export function pageSourceFiles(pagePath: string): string[];
export function scheduledChangesReached(pagePath: string, asOf?: string): string[];
export function pageDates(pagePath: string): { published: string; modified: string };
