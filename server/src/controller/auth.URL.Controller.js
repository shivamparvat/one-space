import { google } from "googleapis";
import AppToken from "../Schema/apptoken.js";
import { Dropbox } from "dropbox";
import fetch from "node-fetch";
import { DROPBOX_STR, GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";
import { fetchUserByToken } from "../middleware/auth.middleware.js";

export async function GoogleAuthUrl(req, res) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const authUrl = await oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.metadata.readonly"],
  });

  res.status(200).json({ authUrl });
}

export async function GoogleCallback(req, res) {
  const { code, state: token } = req.query;

  const user = await fetchUserByToken(res, token);

  const hostUrl = `${req.protocol}://${req.get("host")}`;

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oAuth2Client.getToken(code);

    const findToken = await new AppToken.find({
      user_id: user?._id,
      organization: user?.organization,
    });

    if (!findToken) {
      return res.redirect("/dashboard");
    }

    const newAuth = new AppToken({
      user_id: user?._id,
      organization: user?.organization,
      ...tokens,
      state: GOOGLE_DRIVE_STR,
    });
    await newAuth.save();

    oAuth2Client.setCredentials(tokens);

    // // Initialize Google Drive service
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    // // Step 1: Get the startPageToken for monitoring all changes
    const { data: startPageData } = await drive.changes.getStartPageToken();
    const startPageToken = startPageData.startPageToken;

    // Step 2: Create a unique channel ID and set up the webhook URL
    const channelId = `channel_${Date.now()}`.replace(/[^A-Za-z0-9-_+/=]/g, "");
    const webhookUrl = `https://5dfd-106-222-217-104.ngrok-free.app/api/v1/webhook/drive`; // Webhook URL to receive notifications

    console.log(channelId);
    // Step 3: Set up the watch request on changes feed
    const watchRequest = {
      resource: {
        id: channelId,
        type: "web_hook",
        address: webhookUrl, // Webhook URL to receive change notifications
      },
      pageToken: startPageToken, // Include the required pageToken here
    };

    // Start watching for changes
    const response = await drive.changes.watch(watchRequest);

    return res.redirect("/dashboard"); // Change this to your desired redirect URL
  } catch (error) {
    console.log(error);
    return res.redirect("/dashboard");
  }
}

// Set fetch for Dropbox since the SDK needs it

const config = {
  fetch,
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
};

const dbx = new Dropbox(config);
export async function DropboxAuthUrl(req, res) {
  dbx.auth
    .getAuthenticationUrl(
      process.env.DROPBOX_REDIRECT_URI,
      null,
      "code",
      "offline",
      null,
      "none",
      false
    )
    .then((authUrl) => {
      res.writeHead(302, { Location: authUrl });
      res.end();
    });
}

// {
//   const dbx = new Dropbox({
//     fetch,
//     clientId: process.env.DROPBOX_CLIENT_ID,
//     clientSecret: process.env.DROPBOX_CLIENT_SECRET,
//   });

//   const authUrl = dbx.auth.getAuthenticationUrl(process.env.DROPBOX_REDIRECT_URI, null, 'code', 'offline', null, 'none', false)
//   res.status(200).json({ authUrl });
// }

export async function DropboxCallback(req, res) {
  const { code, state } = req.query;

  try {
    const dbx = new Dropbox({
      fetch,
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
    });

    const response = await dbx.auth.getAccessTokenFromCode(
      process.env.DROPBOX_REDIRECT_URI,
      code
    );

    const { access_token, refresh_token, token_type, scope, expires_in } =
      response.result;

    const newAuth = new AppToken({
      access_token,
      refresh_token,
      token_type,
      scope,
      expiry_date: expires_in,
      state: DROPBOX_STR,
    });

    await newAuth.save();

    return res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    return res.redirect("/dashboard"); // Handle error appropriately
  }
}
