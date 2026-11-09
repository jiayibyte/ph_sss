import type { APIRoute } from 'astro';
import history from '../../data/prc/pnle-history.json';
export const GET: APIRoute = () => new Response(JSON.stringify({
  about: { publisher: 'AyTool', page: 'https://aytool.com/nursing-board-exam-schedule/',
    note: 'Independent transcription and calculations. Every round includes its PRC source and verification route; null values are unavailable, not zero.' },
  ...history,
}), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
