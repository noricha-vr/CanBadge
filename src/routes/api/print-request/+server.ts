import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { printImage } from '$lib/printService';

let printRequests: any[] = [];

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const id = Date.now().toString();
    printRequests.push({ id, ...data, status: 'pending' });
    return json({ id, message: 'Print request received' });
};

export const GET: RequestHandler = async () => {
    return json(printRequests);
};

export const PUT: RequestHandler = async ({ request }) => {
    const { id } = await request.json();
    const printRequest = printRequests.find(req => req.id === id);

    if (printRequest) {
        try {
            await printImage(printRequest.imageData);
            printRequest.status = 'printed';
            return json({ message: 'Print request approved and printed' });
        } catch (error) {
            console.error('Printing error:', error);
            return json({ error: 'Printing failed' }, { status: 500 });
        }
    } else {
        return json({ error: 'Print request not found' }, { status: 404 });
    }
};
