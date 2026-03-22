import nodemailer from 'nodemailer';

// Crée le transporter SMTP (singleton)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Vérifie la connexion SMTP au démarrage
transporter.verify((error) => {
    if (error) {
        console.warn('[MAILER] SMTP connection failed:', error.message);
        console.warn('[MAILER] Les codes seront affichés dans les logs (mode dev).');
    } else {
        console.log('[MAILER] SMTP connection successful');
    }
});

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Election BDE <noreply@example.com>';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #050505; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: #111; border: 1px solid #333; border-radius: 16px; padding: 40px; }
    .title { color: #c9a84c; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 8px; letter-spacing: 4px; text-transform: uppercase; }
    .subtitle { color: #888; text-align: center; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px; }
    .code-box { background: #000; border: 2px solid #c9a84c33; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .code { font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #c9a84c; font-family: monospace; }
    .info { color: #666; font-size: 12px; text-align: center; line-height: 1.6; }
    .footer { color: #444; font-size: 11px; text-align: center; margin-top: 32px; border-top: 1px solid #222; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">Election BDE</div>
    <div class="subtitle">Code de verification</div>
    <p style="color:#aaa; text-align:center; font-size:14px;">
      Utilisez ce code pour acceder au systeme de vote.
    </p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <p class="info">
      Ce code expire dans <strong style="color:#fff">15 minutes</strong>.<br>
      Si vous n avez pas demande ce code, ignorez cet email.
    </p>
    <div class="footer">Election BDE System</div>
  </div>
</body>
</html>`;

    // Si pas de config SMTP configurée, fallback sur logs (mode dev)
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser || smtpUser === 'ton.email@gmail.com') {
        console.log('\n[MAILER FALLBACK] ==========================================');
        console.log('[MAILER FALLBACK] To:', to);
        console.log('[MAILER FALLBACK] Code:', code);
        console.log('[MAILER FALLBACK] ==========================================\n');
        return true;
    }

    try {
        await transporter.sendMail({
            from,
            to,
            subject: 'Votre code de verification - Election BDE',
            html,
            text: 'Votre code Election BDE : ' + code + '\n\nExpire dans 15 minutes.',
        });
        console.log('[MAILER] Email envoye a', to);
        return true;
    } catch (error: any) {
        console.error('[MAILER] Echec envoi:', error.message);
        console.log('[MAILER FALLBACK] Code pour', to, ':', code);
        return false;
    }
}
