<script lang="ts">
	import { onMount } from 'svelte';

	let printRequests: any[] = [];

	async function fetchPrintRequests() {
		const response = await fetch('/api/print-request');
		printRequests = await response.json();
	}

	async function approvePrintRequest(id: string) {
		const response = await fetch(`/api/print-request/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ status: 'approved' })
		});

		if (response.ok) {
			const printData = await response.json();
			openPrintWindow(printData.imageData);
			await fetchPrintRequests();
		} else {
			console.error('Failed to approve print request');
		}
	}

	function openPrintWindow(imageData: string) {
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Image</title>
                    <style>
                        @page {
                            size: 89mm 127mm;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 89mm;
                            height: 127mm;
                        }
                        .image-container {
                            width: 48mm;
                            height: 48mm;
                            border-radius: 50%;
                            overflow: hidden;
                        }
                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    </style>
                </head>
                <body>
                    <div class="image-container">
                        <img src="${imageData}" alt="Print Image">
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        };
                    <\/script>
                </body>
                </html>
            `);
			printWindow.document.close();
		}
	}

	onMount(fetchPrintRequests);
</script>

<h1>印刷リクエスト管理</h1>

<table>
	<thead>
		<tr>
			<th>ID</th>
			<th>ステータス</th>
			<th>プレビュー</th>
			<th>アクション</th>
		</tr>
	</thead>
	<tbody>
		{#each printRequests as request}
			<tr>
				<td>{request.id}</td>
				<td>{request.status}</td>
				<td>
					<img
						src={request.imageData}
						alt="Print Preview"
						style="width: 100px; height: 100px; object-fit: cover;"
					/>
				</td>
				<td>
					{#if request.status === 'pending'}
						<button on:click={() => approvePrintRequest(request.id)}> 承認して印刷 </button>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: left;
	}
	th {
		background-color: #f2f2f2;
	}
</style>
