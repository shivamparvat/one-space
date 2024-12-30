import drive from "@/asset/apps/google-drive.png"
import onedrive from "@/asset/apps/one-drive.png"
import dropbox from "@/asset/apps/dropbox.png"
import gmail from "@/asset/apps/gmail.png"
import notion from "@/asset/apps/notion.png"
import slack from "@/asset/apps/slack.png"

export const GOOGLE_DRIVE_STR = "GOOGLE_DRIVE"
export const GMAIL_STR = "GMAIL"
export const ONE_DRIVE_STR = "ONE_DRIVE"
export const DROPBOX_STR = "DROPBOX"
export const NOTION_STR = "NOTION"
export const SLACK_STR = "SLACK"

const appsList = [
    { id: 1, name: GOOGLE_DRIVE_STR, logo: drive },
    { id: 2, name: ONE_DRIVE_STR, logo: onedrive },
    { id: 3, name: DROPBOX_STR, logo: dropbox },
    { id: 6, name: GMAIL_STR, logo: gmail},
    { id: 5, name: NOTION_STR, logo: notion },
    { id: 4, name: SLACK_STR, logo: slack },
];



export const oauthUrls = {
    "GOOGLE_DRIVE": {
        id: 1,
        name: GOOGLE_DRIVE_STR,
        logo: drive,
        authUrl: "https://accounts.google.com/o/oauth2/auth",
        params: {
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT, // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",                // Use "token" for Implicit flow,
            access_type: "offline",
            prompt:"consent",
            state: GOOGLE_DRIVE_STR,
            scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly", // Scope for Google Drive
        },
    },
    "ONE_DRIVE": {
        id: 2,
        name: ONE_DRIVE_STR,
        logo: onedrive,
        authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        params: {
            client_id: "YOUR_ONEDRIVE_CLIENT_ID", // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,     // Replace with your actual redirect URI
            response_type: "code",                  // Use "token" for Implicit flow,
            state: ONE_DRIVE_STR,
            scope: "Files.ReadWrite",               // Scope for OneDrive
        },
    },
    "DROPBOX": {
        id: 3,
        name: DROPBOX_STR,
        logo: dropbox,
        authUrl: "https://www.dropbox.com/oauth2/authorize",
        params: {
            client_id: process.env.NEXT_PUBLIC_DROP_BOX_CLIENT, // Replace with your actual client ID
            response_type: "code",                // Use "token" for Implicit flow
            redirect_uri: "http://localhost:5000/api/v1/auth/url/dropbox/callback",
            token_access_type: "offline",
            state: DROPBOX_STR,
            scope: "files.metadata.write files.content.read file_requests.write sharing.read contacts.write profile email sharing.write account_info.write"
        },
    },
    "GMAIL": {
    id:4,
    name: GMAIL_STR,
    logo: gmail,
        authUrl: "https://accounts.google.com/o/oauth2/auth",
        params: {
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT, // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",  
            access_type: "offline",
            prompt:"consent",              // Use "token" for Implicit flow,
            state: GMAIL_STR,
            scope: "https://www.googleapis.com/auth/gmail.readonly", // Scope for Gmail
        },
    },
    "NOTION": {
        id: 5,
        name: NOTION_STR,
        logo: notion,
        authUrl: "https://www.notion.so/api/v1/oauth/authorize",
        params: {
            client_id: process.env.NEXT_PUBLIC_NOTION_CLIENT,  // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",                // Use "token" for Implicit flow,
            state: NOTION_STR,
            scope: "read",                        // Modify as per your needs
        },
    },
    "SLACK": {
        id: 6,
        name: SLACK_STR,
        logo: slack,
        authUrl: "https://slack.com/oauth/authorize",
        params: {
            client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT,   // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",                // Use "token" for Implicit flow,
            state: SLACK_STR,
            scope: "commands",                    // Modify as per your needs
        },
    },
};

export const AppKeys = Object.keys(oauthUrls)


export default appsList