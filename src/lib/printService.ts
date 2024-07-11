export async function printImage(imageData: string): Promise<void> {
    // ここで実際の印刷ロジックを実装します
    // 例: node-printerライブラリを使用して印刷する
    console.log('Printing image...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 印刷をシミュレート
    console.log('Image printed successfully');
}
