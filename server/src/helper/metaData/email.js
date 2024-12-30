import { google } from "googleapis";
import { GMAIL_STR } from "../../constants/appNameStr";

export async function getEmailsFromGmail(accessToken, user_id, organization) {
  const authClient = await authorizeGmail(accessToken);
  const emails = await listGmailMessagesRecursively(authClient, user_id, organization);
  const emailDataToInsert = emails.map((email) => {
    return {
      updateOne: {
        filter: { doc_id: email.id, user_id, organization },
        update: {
          $set: {
            message_id: email.id,
            user_id,
            organization,
            data: email,
            app_name: GMAIL_STR,
          },
        },
        upsert: true,
      },
    };
  });
  await EmailData.bulkWrite(emailDataToInsert);
}

export function authorizeGmail(token) {
  return new Promise((resolve, reject) => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials(token);
    resolve(oAuth2Client);
  });
}

export function listGmailMessages(auth, pageToken = null, maxResults = 100) {
  return new Promise((resolve, reject) => {
    const gmail = google.gmail({ version: "v1", auth });
    gmail.users.messages.list(
      {
        userId: "me",
        maxResults,
        pageToken,
      },
      (err, res) => {
        if (err) {
          console.error("The API returned an error:", err);
          return reject(err);
        }
        resolve(res.data);
      }
    );
  });
}

export async function loadGmailMessage(auth, messageId) {
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const message = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });

    const { payload } = message.data;
    const headers = payload.headers.reduce((acc, header) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    }, {});
    const bodyData = payload.body?.data
      ? Buffer.from(payload.body.data, "base64").toString("utf-8")
      : "";

    return {
      id: messageId,
      headers,
      snippet: message.data.snippet,
      body: bodyData,
    };
  } catch (err) {
    console.error("Error loading Gmail message:", err);
    throw new Error("Failed to retrieve the email message");
  }
}

export async function listGmailMessagesRecursively(authClient, user_id, organization, pageToken = null, totalPages = 100) {
  const allMessages = [];
  for (let i = 0; i < totalPages; i++) {
    const { messages, nextPageToken } = await listGmailMessages(authClient, pageToken);
    if (!messages || messages.length === 0) break;

    for (const message of messages) {
      const emailData = await loadGmailMessage(authClient, message.id);
      allMessages.push({
        updateOne: {
          filter: { message_id: emailData.id, user_id, organization },
          update: {
            $set: {
              message_id: emailData.id,
              user_id,
              organization,
              data: emailData,
            },
          },
          upsert: true,
        },
      });
    }

    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }
  return allMessages;
}