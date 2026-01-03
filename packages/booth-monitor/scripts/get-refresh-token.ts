
import { google } from 'googleapis';
import { createInterface } from 'readline';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar'
];

async function getRefreshToken() {
    const readline = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const question = (query: string): Promise<string> => {
        return new Promise((resolve) => {
            readline.question(query, resolve);
        });
    };

    console.log('=== Google OAuth 2.0 Refresh Token Generator ===');
    console.log('You need to create an OAuth 2.0 Client ID in Google Cloud Console first.');
    console.log('Redirect URI should be set to: http://localhost');

    const clientId = await question('Enter Client ID: ');
    const clientSecret = await question('Enter Client Secret: ');

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost' // Redirect URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force to receive refresh token
    });

    console.log('\nAuthorize this app by visiting this url:');
    console.log(authUrl);

    const code = await question('\nEnter the code from that page here: ');

    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n✅ Successfully retrieved tokens!');
        console.log('\nAdd these to your .env or GitHub Secrets:');
        console.log(`GOOGLE_CLIENT_ID=${clientId}`);
        console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

        if (!tokens.refresh_token) {
            console.log('\n⚠️ No refresh_token returned. Did you approve access correctly? Try revoking access and running again.');
        }

    } catch (error) {
        console.error('❌ Error retrieving access token:', error);
    } finally {
        readline.close();
        process.exit();
    }
}

getRefreshToken();
