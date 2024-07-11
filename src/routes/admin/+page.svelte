<script lang="ts">
	import { onMount } from 'svelte';

	let printRequests: any[] = [];

	async function fetchPrintRequests() {
		const response = await fetch('/api/print-request');
		printRequests = await response.json();
	}

	async function approvePrintRequest(id: string) {
		const response = await fetch('/api/print-request', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		});

		if (response.ok) {
			await fetchPrintRequests();
		} else {
			console.error('Failed to approve print request');
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
			<th>アクション</th>
		</tr>
	</thead>
	<tbody>
		{#each printRequests as request}
			<tr>
				<td>{request.id}</td>
				<td>{request.status}</td>
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
