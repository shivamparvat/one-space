import { google } from "googleapis";
import { GMAIL_STR } from "../../constants/appNameStr.js";
import { authorizeGoogleDrive } from "./drive.js";
import Filedata from "../../Schema/fileMetadata.js";
import fs from "fs"
import cache from "../../redis/cache.js";
import User from "../../Schema/userSchema.js";


export async function getEmailsFromGmail(accessToken, user_id, organization) {
  try {
    const authClient = await authorizeGoogleDrive(accessToken);
    const emails = await listGmailMessagesRecursively(authClient, user_id, organization);

    await Filedata.bulkWrite(emails);
  } catch (error) {
    console.log(error, "error")
  }
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
    const isDeleted = labels.includes("TRASH");

    console.log("running...", message.data.historyId)
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
      modifiedTime: new Date(parseInt(timestamp)).toISOString(), // Convert timestamp to readable date
      trashed: isDeleted
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
          filter: { doc_id: emailData.id, user_id, organization },
          update: {
            $set: {
              doc_id: emailData.id,
              user_id,
              organization,
              data: await processEmailData(emailData, user_id),
              app_name: GMAIL_STR
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



export async function getStartHistoryId(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  try {
      // Fetch the latest message from the user's mailbox
      const messageListResponse = await gmail.users.messages.list({
          userId: 'me',
          maxResults: 1, // Retrieve only the latest message
      });

      const messages = messageListResponse.data.messages;

      if (messages && messages.length > 0) {
          const latestMessageId = messages[0].id;

          // Fetch the message details to get the historyId
          const messageResponse = await gmail.users.messages.get({
              userId: 'me',
              id: latestMessageId,
          });

          const startHistoryId = messageResponse.data.historyId;

          return startHistoryId;
      } else {
          return null;
      }
  } catch (error) {
      console.error('Error retrieving startHistoryId:', error.message);
      throw error; // Re-throw the error for higher-level handling
  }
}

/**
 * Function to get new updates from Gmail using the startHistoryId.
 * @param {Object} auth - The authenticated OAuth2 client.
 * @param {string} startHistoryId - The start history ID to fetch updates from.
 * @returns {Promise<{historyId: string, changes: Array}>} - The new historyId and list of changes.
 */

export async function getNewUpdates(auth, startHistoryId) {
  const gmail = google.gmail({ version: 'v1', auth });

  try {
      // Fetch changes in the Gmail account since the given startHistoryId
      const res = await gmail.users.history.list({
          userId: 'me',
          startHistoryId: startHistoryId,
      });

      const history = res.data.history || [];
      const changes = [];

      // Process the changes and store the relevant information
      history.forEach(change => {
          if (change.messagesAdded) {
              changes.push({
                  type: 'added',
                  messages: change.messagesAdded,
              });
          }
          if (change.messagesDeleted) {
              changes.push({
                  type: 'deleted',
                  messages: change.messagesDeleted,
              });
          }
          if (change.labelsAdded) {
              changes.push({
                  type: 'labelAdded',
                  labels: change.labelsAdded,
              });
          }
          if (change.labelsRemoved) {
              changes.push({
                  type: 'labelRemoved',
                  labels: change.labelsRemoved,
              });
          }
      });

      const newHistoryId = res.data.historyId;

      // Check if the historyId has changed
      if (newHistoryId !== startHistoryId) {
          return { historyId: newHistoryId, changes: changes };
      } else {
          return { historyId: startHistoryId, changes: [] };
      }
  } catch (error) {
      console.error('Error fetching new updates:', error.message);
      throw error;
  }
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



async function processEmailData(emailData, user_id) {

  const cacheKey = `org_user_${user_id}`
  let user = await cache.get(cacheKey) 
  if(!user){
    user = await User.findById(user_id).populate("organization");
    await cache.set(cacheKey,user,60*60*5) 
  }
  const organization = user?.organization

  const organizationDomain = organization?.domain

  const extractEmails = (field) => {
    if (!field) return [];
    return field
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean); // Remove empty strings
  };

  const emails = [
    ...extractEmails(emailData.to),
    ...extractEmails(emailData.cc),
    ...extractEmails(emailData.bcc),
  ];

  const result = emails.reduce(
    (acc, emailStr) => {
     const email = extractEmailStr(emailStr)
      if (email.endsWith(`@${organizationDomain}`)) {
        acc.internal.push(email);
      } else {
        acc.external.push(email);
      }
      return acc;
    },
    { internal: [], external: [] }
  );

  return {
    ...emailData,
    internalCount: result.internal.length,
    externalCount: result.external.length,
    internalUsers: result.internal,
    externalUsers: result.external,
  };
}


function extractEmail(str) {
  const emailRegex = /<([^>]+)>/;
  const match = str.match(emailRegex);
  return match ? match[1] : null; // Return the email if found, otherwise null
}


function extractEmailStr(str) {
  const emailRegex = /<([^>]+)>/;
  const match = str.match(emailRegex);
  return match ? match[1] : str; // Return the email if found, otherwise null
}







