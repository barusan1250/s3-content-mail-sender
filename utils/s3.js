import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

let s3Client = null;

function getS3Client() {
    if (!s3Client) {
        s3Client = new S3Client({
            region: process.env.AWS_REGION || 'ap-northeast-1',
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true'
        });
    }
    return s3Client;
}

/**
 * S3からテキストコンテンツを取得する
 * @param {string} bucketName - バケット名
 * @param {string} key - オブジェクトキー
 * @returns {Promise<{body: string, contentType: string}>}
 */
export async function getTextContent(bucketName, key) {
    const s3 = getS3Client();
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    try {
        const response = await s3.send(command);
        const body = await response.Body.transformToString("utf-8");
        const contentType = response.ContentType || "text/plain";
        console.log(`[S3] Text retrieved: s3://${bucketName}/${key} (${contentType}, ${body.length} chars)`);
        return { body, contentType };
    } catch (error) {
        console.error(`[S3] Error fetching text from s3://${bucketName}/${key}:`, error);
        throw error;
    }
}

/**
 * S3から音声ファイルをBuffer形式で取得する
 * @param {string} bucketName - バケット名
 * @param {string} key - オブジェクトキー
 * @returns {Promise<{buffer: Buffer, contentType: string, filename: string}>}
 */
export async function getAudioContent(bucketName, key) {
    const s3 = getS3Client();
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    try {
        const response = await s3.send(command);
        const byteArray = await response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);
        const contentType = response.ContentType || "audio/mpeg";
        const filename = key.split('/').pop();
        console.log(`[S3] Audio retrieved: s3://${bucketName}/${key} (${contentType}, ${buffer.length} bytes)`);
        return { buffer, contentType, filename };
    } catch (error) {
        console.error(`[S3] Error fetching audio from s3://${bucketName}/${key}:`, error);
        throw error;
    }
}
