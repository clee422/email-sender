import google from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function createTransporter() {
    const oauth2Client = new google.Auth.OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground",
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) reject(new Error("Failed to get access token: " + err));
            resolve(token);
        });
    });

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });
}

async function sendEmail() {
    try {
        const transporter = await createTransporter();

        await transporter.verify(); // Sanity check before sending
        console.log("Connected to Gmail ✓");

        const info = await transporter.sendMail({
            from: `"My App" <${process.env.GMAIL_USER}>`,
            to: "myemail@gmail.com",
            subject: "Testing sending email through code",
            html: "<p>Testing testing hello</p>",
        });

        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.error("Error:", error);
    }
}

sendEmail();
