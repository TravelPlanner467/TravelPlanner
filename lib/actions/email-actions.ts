import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({
                                                email,
                                                url,
                                                token
                                            }: {
    email: string;
    url: string;
    token: string;
}) {
    try {
        await resend.emails.send({
            from: 'Test-Domain <onboarding@resend.dev>', // Use your verified domain
            to: email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to TravelPlanner!</h2>
                    <p>Please verify your email address by clicking the button below:</p>
                    <a href="${url}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                              color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                        Verify Email
                    </a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${url}</p>
                    <p style="color: #666; font-size: 14px; margin-top: 24px;">
                        This link will expire in 24 hours. If you didn't request this, please ignore this email.
                    </p>
                </div>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return { success: false, error };
    }
}
