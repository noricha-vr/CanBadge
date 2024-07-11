import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'print_requests.json');

export interface PrintRequest {
    id: string;
    imageData: string;
    status: 'pending' | 'approved' | 'printed';
}

export function readPrintRequests(): PrintRequest[] {
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

export function writePrintRequests(requests: PrintRequest[]): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(requests, null, 2));
}

export function addPrintRequest(request: PrintRequest): void {
    const requests = readPrintRequests();
    requests.push(request);
    writePrintRequests(requests);
}

export function updatePrintRequest(id: string, updates: Partial<PrintRequest>): boolean {
    const requests = readPrintRequests();
    const index = requests.findIndex(req => req.id === id);
    if (index !== -1) {
        requests[index] = { ...requests[index], ...updates };
        writePrintRequests(requests);
        return true;
    }
    return false;
}
