<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	let imageUrl = '';
	let scale = 100; // Changed from 1 to 100 for percentage-based scaling
	let rotation = 0;
	let offsetX = 0;
	let offsetY = 0;
	let canvas: HTMLCanvasElement;
	let previewCanvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let previewCtx: CanvasRenderingContext2D | null;
	let printRequestStatus = '';

	async function handlePrint() {
		const dataUrl = canvas.toDataURL('image/png');

		try {
			const response = await fetch('/api/print-request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ imageData: dataUrl })
			});

			if (response.ok) {
				const result = await response.json();
				printRequestStatus = `印刷リクエストを送信しました。リクエストID: ${result.id}`;
			} else {
				printRequestStatus = '印刷リクエストの送信に失敗しました。';
			}
		} catch (error) {
			console.error('Error:', error);
			printRequestStatus = '印刷リクエストの送信中にエラー発生しました。';
		}
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			imageUrl = URL.createObjectURL(file);
			// 画像が��ードされた後に描画を行う
			const img = new Image();
			img.onload = () => {
				resetControls();
				drawImage();
			};
			img.src = imageUrl;
		}
	}

	function resetControls() {
		scale = 100; // Changed from 1 to 100 for percentage-based scaling
		rotation = 0;
		offsetX = 0;
		offsetY = 0;
	}

	function handleScale(event: Event) {
		const target = event.target as HTMLInputElement;
		scale = parseFloat(target.value);
		drawImage();
	}

	function handleRotation(event: Event) {
		const target = event.target as HTMLInputElement;
		rotation = parseInt(target.value);
		drawImage();
	}

	function handleOffsetX(event: Event) {
		const target = event.target as HTMLInputElement;
		offsetX = parseInt(target.value);
		drawImage();
	}

	function handleOffsetY(event: Event) {
		const target = event.target as HTMLInputElement;
		offsetY = parseInt(target.value);
		drawImage();
	}

	function drawImage() {
		if (!ctx || !previewCtx || !imageUrl) return;

		const img = new Image();
		img.onload = () => {
			// Clear both canvases
			ctx!.clearRect(0, 0, canvas.width, canvas.height);
			previewCtx!.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

			// Calculate fine-grained scale
			const fineScale = scale / 100; // Convert percentage to scale factor

			// Draw on main canvas
			ctx!.save();
			ctx!.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
			ctx!.rotate((rotation * Math.PI) / 180);
			ctx!.scale(fineScale, fineScale);

			// Draw on preview canvas
			previewCtx!.save();
			previewCtx!.translate(previewCanvas.width / 2 + offsetX, previewCanvas.height / 2 + offsetY);
			previewCtx!.rotate((rotation * Math.PI) / 180);
			previewCtx!.scale(fineScale, fineScale);

			// 画像のアスペクト比を維持しつつ、キャンバスに合わせて拡大縮小
			const aspectRatio = img.width / img.height;
			let drawWidth: number, drawHeight: number;
			if (canvas.width / canvas.height > aspectRatio) {
				drawHeight = canvas.height;
				drawWidth = drawHeight * aspectRatio;
			} else {
				drawWidth = canvas.width;
				drawHeight = drawWidth / aspectRatio;
			}

			// Draw image on both canvases
			ctx!.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
			previewCtx!.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

			// Restore transformations
			ctx!.restore();
			previewCtx!.restore();

			// Draw circular frame on main canvas
			ctx!.globalCompositeOperation = 'destination-in';
			ctx!.beginPath();
			ctx!.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
			ctx!.fill();
			ctx!.globalCompositeOperation = 'source-over';

			// Draw circular frame on preview canvas only
			previewCtx!.globalCompositeOperation = 'destination-in';
			previewCtx!.beginPath();
			previewCtx!.arc(
				previewCanvas.width / 2,
				previewCanvas.height / 2,
				previewCanvas.width / 2,
				0,
				Math.PI * 2
			);
			previewCtx!.fill();
			previewCtx!.globalCompositeOperation = 'source-over';

			// Draw thin circular line 4mm inside on preview canvas only
			const mmToPx = (mm: number) => (mm / 25.4) * 96; // Convert mm to pixels (assuming 96 DPI)
			const lineWidth = mmToPx(14); // 14mm
			const radius = previewCanvas.width / 2 - lineWidth / 2;

			previewCtx!.beginPath();
			previewCtx!.arc(previewCanvas.width / 2, previewCanvas.height / 2, radius, 0, Math.PI * 2);
			previewCtx!.lineWidth = 1; // Thin line
			previewCtx!.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Light color
			previewCtx!.stroke();
		};
		img.src = imageUrl;
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		previewCtx = previewCanvas.getContext('2d');
		canvas.width = 500;
		canvas.height = 500;
		previewCanvas.width = 500;
		previewCanvas.height = 500;
	});
</script>

<div class="image-editor">
	{#if !imageUrl}
		<div class="bg-white p-3 w-full pt-10">
			<div class="control-item text-center w-2/3 mx-auto">
				<div class="mb-3">印刷したい画像をアップロードしてください</div>
				<label for="file-upload" class="file-upload-label">画像をアップロード</label>
				<input id="file-upload" type="file" on:change={handleFileUpload} accept="image/*" />
			</div>
		</div>
	{/if}

	{#if !printRequestStatus}
		<div class="canvas-container bg-white p-3">
			<canvas bind:this={canvas} style="display: none;"></canvas>
			<canvas bind:this={previewCanvas}></canvas>
		</div>
		<div class="control-panel">
			<div class="control-item">
				<div>
					黒い線の<strong>内側</strong>が缶バッチの<strong>正面</strong>から見えます
				</div>
				<div>
					黒い線の<strong>外側</strong>は缶バッチの<strong>側面</strong>から見えます
				</div>
			</div>
			<div class="control-item">
				<label>
					拡大縮小:
					<input
						type="range"
						min="50"
						max="150"
						step="1"
						bind:value={scale}
						on:input={handleScale}
					/>
				</label>
			</div>
			<div class="control-item">
				<label>
					回転:
					<input
						type="range"
						min="0"
						max="360"
						step="1"
						bind:value={rotation}
						on:input={handleRotation}
					/>
				</label>
			</div>
			<div class="control-item">
				<label>
					左右:
					<input
						type="range"
						min="-100"
						max="100"
						step="1"
						bind:value={offsetX}
						on:input={handleOffsetX}
					/>
				</label>
			</div>
			<div class="control-item">
				<label>
					上下:
					<input
						type="range"
						min="-100"
						max="100"
						step="1"
						bind:value={offsetY}
						on:input={handleOffsetY}
					/>
				</label>
			</div>
			<button on:click={handlePrint} class="print-button">印刷</button>
		</div>
	{/if}

	{#if printRequestStatus}
		<div class="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto mt-8">
			<div class="text-4xl mb-4 text-center">🎉</div>
			<div class="text-center">
				<h3 class="text-xl font-bold text-gray-800 mb-2">印刷リクエストを送信しました</h3>
				<p class="text-gray-600">スタッフにスマホの画面をお見せください</p>
				<p class="text-gray-800 mt-4">
					リクエストID: {printRequestStatus.split(':')[1].trim()}
				</p>
			</div>
			<div class="mt-4">
				<img
					src={canvas.toDataURL('image/png')}
					alt="印刷画像"
					class="mx-auto rounded-full"
					style="width: 200px; height: 200px; object-fit: cover;"
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	/* 前回と同じスタイル */
	.image-editor {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 600px;
		margin: 0 auto;
		font-family: Arial, sans-serif;
	}

	.control-panel {
		width: 100%;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
		margin-bottom: 20px;
		background-color: #f9f9f9;
	}

	.control-item {
		margin-bottom: 15px;
	}

	.control-item label {
		display: block;
		margin-bottom: 5px;
	}

	input[type='range'] {
		width: 100%;
	}

	.file-upload-label {
		display: inline-block;
		padding: 10px 15px;
		background-color: #4caf50;
		color: white;
		border-radius: 4px;
		cursor: pointer;
	}

	input[type='file'] {
		display: none;
	}

	.print-button {
		display: block;
		width: 100%;
		padding: 10px;
		background-color: #008cba;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}

	.print-button:hover {
		background-color: #007b9a;
	}

	.canvas-container {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	canvas {
		border: 1px solid #ccc;
		max-width: 100%;
		height: auto;
	}
</style>
