import drive from "@/asset/apps/google-drive.png"
import onedrive from "@/asset/apps/one-drive.png"
import dropbox from "@/asset/apps/dropbox.png"
import gmail from "@/asset/apps/gmail.png"
import notion from "@/asset/apps/notion.png"
import slack from "@/asset/apps/slack.png"

const appsList = [
    {id: 1, name: 'Google Drive', logo: drive},
    {id: 2, name: 'OneDrive', logo: onedrive},
    {id: 3, name: 'Dropbox', logo: dropbox},
    // {id: 6, name: 'Gmail', logo: gmail},
    {id: 5, name: 'Notion', logo: notion},
    {id: 4, name: 'Slack', logo: slack},
];


export const oauthUrls = {
    "Google Drive": {
        id: 1,
        name: 'Google Drive',
        logo: drive,
        authUrl: "https://accounts.google.com/o/oauth2/auth",
        params: {
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT, // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",                // Use "token" for Implicit flow,
            state: "Google Drive",
            scope: "https://www.googleapis.com/auth/drive.file", // Scope for Google Drive

        },
    },
    "OneDrive": {
        id: 2,
        name: 'OneDrive',
        logo: onedrive,
        authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        params: {
            client_id: "YOUR_ONEDRIVE_CLIENT_ID", // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,     // Replace with your actual redirect URI
            response_type: "code",                  // Use "token" for Implicit flow,
            state: "OneDrive",
            scope: "Files.ReadWrite",               // Scope for OneDrive
        },
    },
    "Dropbox": {
        id: 3,
        name: 'Dropbox',
        logo: dropbox,
        authUrl: "https://www.dropbox.com/oauth2/authorize",
        params: {
            client_id: process.env.NEXT_PUBLIC_DROP_BOX_CLIENT, // Replace with your actual client ID
            response_type: "code",                // Use "token" for Implicit flow
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,
            state: "Dropbox",
        },
    },
    // "Gmail": {
    // id:4,
    // name: 'Gmail',
    // logo: gmail,
    //     authUrl: "https://accounts.google.com/o/oauth2/auth",
    //     params: {
    //         client_id: "YOUR_GMAIL_CLIENT_ID",   // Replace with your actual client ID
    //         redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
    //         response_type: "code",                // Use "token" for Implicit flow,
    //         state:"name: 'Gmail",
    //         scope: "https://www.googleapis.com/auth/gmail.readonly", // Scope for Gmail
    //     },
    // },
    "Notion": {
        id: 5,
        name: 'Notion',
        logo: notion,
        authUrl: "https://www.notion.so/api/v1/oauth/authorize",
        params: {
            client_id: process.env.NEXT_PUBLIC_NOTION_CLIENT,  // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",                // Use "token" for Implicit flow,
            state: "Notion",
            scope: "read",                        // Modify as per your needs
        },
    },
    "Slack": {
        id: 6,
        name: 'Slack',
        logo: slack,
        authUrl: "https://slack.com/oauth/authorize",
        params: {
            client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT,   // Replace with your actual client ID
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,   // Replace with your actual redirect URI
            response_type: "code",                // Use "token" for Implicit flow,
            state: "Slack",
            scope: "commands",                    // Modify as per your needs
        },
    },
};

export const AppKeys = Object.keys(oauthUrls)


export default appsList