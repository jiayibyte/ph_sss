/**
 * Subscribable calendar per exam page: /data/prc/feed/<slug>.ics. Calendar apps
 * re-fetch it, so next year's dates reach subscribers as soon as the PRC rule
 * JSON for that year is added (src/lib/prcFeeds.ts).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { PRC_FEEDS, feedIcs, type PrcFeed } from '../../../../lib/prcFeeds';

export const getStaticPaths: GetStaticPaths = () =>
  PRC_FEEDS.map((feed) => ({ params: { slug: feed.slug }, props: { feed } }));

export const GET: APIRoute = ({ props }) =>
  new Response(feedIcs(props.feed as PrcFeed), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
