import { google } from "googleapis";
import { GMAIL_STR } from "../../constants/appNameStr.js";
import { authorizeGoogleDrive } from "./drive.js";
import Filedata from "../../Schema/fileMetadata.js";


export async function getEmailsFromGmail(accessToken, user_id, organization) {
  const authClient = await authorizeGoogleDrive(accessToken);
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
  console.log("d gfhfgk f fgk hf")
  await Filedata.bulkWrite(emailDataToInsert);
}

export function listGmailMessages(auth, pageToken = null, maxResults = 100) {
  const query = "label:IMPORTANT after:2024/01/01"

  return new Promise((resolve, reject) => {
    const gmail = google.gmail({ version: "v1", auth });
    gmail.users.messages.list(
      {
        userId: "me",
        maxResults,
        pageToken,
        q: query,
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
      format: "full"
    });

    const headers = message.data.payload.headers;
    const body = extractMessageBody(message.data.payload);
    const labels = message.data.labelIds || [];
    const timestamp = message.data.internalDate; // Timestamp is in internalDate
    const attachments = extractAttachments(message.data.payload);

    console.log("running...")
    return {
      id: message.data.id,
      threadId: message.data.threadId,
      from: getHeader(headers, "From"),
      to: getHeader(headers, "To"),
      cc: getHeader(headers, "Cc"),
      bcc: getHeader(headers, "Bcc"),
      subject: getHeader(headers, "Subject"),
      message: body,
      labels: labels,
      attachments: attachments,
      timestamp: new Date(parseInt(timestamp)).toISOString(), // Convert timestamp to readable date
    };
  } catch (err) {
    console.error("Error loading Gmail message:", err);
    throw new Error("Failed to retrieve the email message");
  }
}

export async function listGmailMessagesRecursively(authClient, user_id, organization, pageToken = null, totalPages = 100) {
  const allMessages = [];
  for (let i = 0; i < totalPages; i++) {
    const data = await listGmailMessages(authClient, pageToken);
    const { messages, nextPageToken } = await listGmailMessages(authClient, pageToken);
    if (!messages || messages.length === 0) break;

    for (const message of messages) {
      const emailData = await loadGmailMessage(authClient, message.id);
      allMessages.push({
        updateOne: {
          filter: { doc_id: emailData.id, user_id, organization },
          update: {
            $set: {
              doc_id: emailData.id,
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


function getHeader(headers, name) {
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : null;
}

function extractMessageBody(payload) {
  let body = "";

  if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  } else if (payload.parts) {
    payload.parts.forEach((part) => {
      if (part.mimeType === "text/plain" && part.body.data) {
        body += Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    });
  }
  return body.trim();
}

function extractAttachments(payload) {
  const attachments = [];

  if (payload.parts) {
    payload.parts.forEach((part) => {
      if (part.filename) {
        attachments.push(part.filename);
      }
    });
  }

  return attachments;
}
