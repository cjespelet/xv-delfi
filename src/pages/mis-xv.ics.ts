import type { APIRoute } from 'astro';
import event from '../data/event.json';
import { buildIcs } from '../utils/format';

export const GET: APIRoute = () => {
  const body = buildIcs(
    `XV de ${event.honoree}`,
    event.eventDate,
    `${event.party.venue}, ${event.party.address}`,
    event.site.description,
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mis-xv.ics"',
    },
  });
};
