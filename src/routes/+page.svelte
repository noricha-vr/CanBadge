<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	let imageUrl = '';
	let scale = 1;
	let rotation = 0;
	let offsetX = 0;
	let offsetY = 0;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			imageUrl = URL.createObjectURL(file);
			// 画像がロードされた後に描画を行う
			const img = new Image();
			img.onload = () => {
				resetControls();
				drawImage();
			};
			img.src = imageUrl;
		}
	}

	function resetControls() {
		scale = 1;
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
		if (!ctx || !imageUrl) return;

		const img = new Image();
		img.onload = () => {
			ctx!.clearRect(0, 0, canvas.width, canvas.height);
			ctx!.save();
			ctx!.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
			ctx!.rotate((rotation * Math.PI) / 180);
			ctx!.scale(scale, scale);

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

			ctx!.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
			ctx!.restore();

			// Draw circular frame
			ctx!.globalCompositeOperation = 'destination-in';
			ctx!.beginPath();
			ctx!.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
			ctx!.fill();
			ctx!.globalCompositeOperation = 'source-over';
		};
		img.src = imageUrl;
	}

	function handlePrint() {
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(
				'<img src="' + canvas.toDataURL() + '" onload="window.print();window.close()" />'
			);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		canvas.width = 500;
		canvas.height = 500;
	});
</script>

<div class="image-editor">
	<div class="control-panel">
		<div class="control-item">
			<label for="file-upload" class="file-upload-label">画像をアップロード</label>
			<input id="file-upload" type="file" on:change={handleFileUpload} accept="image/*" />
		</div>
		<div class="control-item">
			<label>
				拡大縮小:
				<input
					type="range"
					min="0.1"
					max="2"
					step="0.1"
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
	<div class="canvas-container">
		<canvas bind:this={canvas}></canvas>
	</div>
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
