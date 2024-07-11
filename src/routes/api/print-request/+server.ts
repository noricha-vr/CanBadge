import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readPrintRequests, addPrintRequest } from '$lib/db';
import type { PrintRequest } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const id = Date.now().toString();
    const newRequest: PrintRequest = { id, ...data, status: 'pending' };
    addPrintRequest(newRequest);
    return json({ id, message: 'Print request received' });
};

export const GET: RequestHandler = async () => {
    return json(readPrintRequests());
};
