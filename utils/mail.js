import { createTransport } from "nodemailer";

/**
 * SMTP経由でメールを送信する
 * 
 * @param {object} options
 * @param {string} options.from - 送信元メールアドレス
 * @param {string[]} options.to - 送信先メールアドレスの配列
 * @param {string} options.subject - 件名
 * @param {string} options.textBody - テキスト本文
 * @param {string} options.contentType - 本文のコンテンツタイプ (text/plain or text/html)
 * @param {Buffer} [options.audioBuffer] - 音声ファイルのBuffer (添付ファイル用)
 * @param {string} [options.audioContentType] - 音声のコンテンツタイプ
 * @param {string} [options.audioFilename] - 音声ファイル名
 * @returns {Promise<object>}
 */
export async function sendMailWithAttachment({
    from,
    to,
    subject,
    textBody,
    contentType = "text/plain",
    audioBuffer,
    audioContentType = "audio/mpeg",
    audioFilename = "audio.mp3",
}) {
    const dryRun = process.env.MAIL_DRY_RUN === 'true';

    // ── Dry-run モード ──
    if (dryRun) {
        console.log("=".repeat(60));
        console.log("[MAIL DRY-RUN] メール送信をシミュレートします");
        console.log("=".repeat(60));
        console.log(`From:       ${from}`);
        console.log(`To:         ${to.join(", ")}`);
        console.log(`Subject:    ${subject}`);
        console.log(`Body Type:  ${contentType}`);
        console.log(`Attachment: ${audioBuffer ? `${audioFilename} (${audioBuffer.length} bytes)` : "なし"}`);
        console.log("-".repeat(60));
        // 本文のプレビュー
        console.log(textBody.length > 500 ? textBody.substring(0, 500) + "..." : textBody);
        console.log("=".repeat(60));
        return { messageId: "dry-run-" + Date.now(), dryRun: true };
    }

    // ── SMTP設定 ──
    const transporterConfigs = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    };

    // 認証情報がある場合
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporterConfigs.auth = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        };
    }

    const transporter = createTransport(transporterConfigs);

    const isHtml = contentType.includes("html");
    const mailOptions = {
        from,
        to: to.join(", "),
        subject,
        [isHtml ? 'html' : 'text']: textBody,
    };

    // 添付ファイル
    if (audioBuffer) {
        mailOptions.attachments = [
            {
                filename: audioFilename,
                content: audioBuffer,
                contentType: audioContentType,
            },
        ];
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAIL] Email sent successfully. MessageId: ${info.messageId}`);
        return { messageId: info.messageId };
    } catch (error) {
        console.error("[MAIL] Error sending email via SMTP:", error);
        throw error;
    }
}
