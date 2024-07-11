import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updatePrintRequest, readPrintRequests } from '$lib/db';

export const PUT: RequestHandler = async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json();

    const success = updatePrintRequest(id, { status });
    if (success) {
        const updatedRequest = readPrintRequests().find(req => req.id === id);
        return json(updatedRequest);
    } else {
        return json({ error: 'Print request not found' }, { status: 404 });
    }
};
