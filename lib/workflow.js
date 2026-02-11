import { getTextContent, getAudioContent } from '../utils/s3.js';
import { sendMailWithAttachment } from '../utils/mail.js';

/**
 * S3からコンテンツを取得し、SMTP経由でメール送信するワークフロー
 */
export async function executeMailSendFlow() {
    console.log("Starting Mail Send Flow...");

    // ── 環境変数バリデーション ──
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME is not defined");
    }

    const textKey = process.env.S3_TEXT_KEY;
    if (!textKey) {
        throw new Error("S3_TEXT_KEY is not defined");
    }

    const audioKey = process.env.S3_AUDIO_KEY;

    const fromEmail = process.env.MAIL_FROM_EMAIL;
    if (!fromEmail) {
        throw new Error("MAIL_FROM_EMAIL is not defined");
    }

    const toEmails = (process.env.MAIL_TO_EMAILS || "")
        .split(",")
        .map(e => e.trim())
        .filter(Boolean);
    if (toEmails.length === 0) {
        throw new Error("MAIL_TO_EMAILS is not defined");
    }

    const subject = process.env.MAIL_SUBJECT || "S3 Content Mail";

    // ── 1. S3からテキスト取得 ──
    console.log(`Fetching text from s3://${bucketName}/${textKey}...`);
    const { body: textBody, contentType } = await getTextContent(bucketName, textKey);

    // ── 2. S3から音声ファイル取得 (オプション) ──
    let audioBuffer = null;
    let audioContentType = null;
    let audioFilename = null;

    if (audioKey) {
        console.log(`Fetching audio from s3://${bucketName}/${audioKey}...`);
        const audio = await getAudioContent(bucketName, audioKey);
        audioBuffer = audio.buffer;
        audioContentType = audio.contentType;
        audioFilename = audio.filename;
    }

    // ── 3. メール送信 ──
    console.log(`Sending email to: ${toEmails.join(", ")}...`);
    const result = await sendMailWithAttachment({
        from: fromEmail,
        to: toEmails,
        subject,
        textBody,
        contentType,
        audioBuffer,
        audioContentType,
        audioFilename,
    });

    console.log("Mail Send Flow completed successfully!");
    return {
        success: true,
        messageId: result.messageId,
        dryRun: result.dryRun || false,
    };
}
