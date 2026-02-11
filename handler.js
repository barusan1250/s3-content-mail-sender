import { executeMailSendFlow } from './lib/workflow.js';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * AWS Lambda Handler
 * S3からテキスト+音声を取得し、SESでメール送信する
 */
export const handler = async (event) => {
    console.log("Lambda triggered.");
    try {
        const result = await executeMailSendFlow();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success", ...result })
        };
    } catch (error) {
        console.error("Lambda Error:", error);
        throw error;
    }
};

/**
 * CLI Entry Point
 * Runs only when the file is executed directly (e.g., node handler.js)
 */
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
    (async () => {
        try {
            const dotenv = await import('dotenv');
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            dotenv.config({ path: path.resolve(__dirname, './.env') });
        } catch (e) {
            // Silence warning if dotenv is intentionally missing in some environments
        }

        console.log("🚀 Invoking S3 Content Mail Sender via CLI...");
        try {
            const result = await executeMailSendFlow();
            console.log("✅ Execution Result:", result);
        } catch (error) {
            console.error("❌ Execution Failed:", error);
            process.exit(1);
        }
    })();
}
