import { google } from "googleapis";
import { GMAIL_STR } from "../constants/appNameStr.js";
import { authorizeGoogleDrive } from "../helper/metaData/drive.js";
import AppToken from "../Schema/apptoken.js";
import User from "../Schema/userSchema.js";
import Filedata from "../Schema/fileMetadata.js";
import { createGoolgeDriveEmbedding } from "../helper/Embedding.js";
import cache from "../redis/cache.js";
import embeddingQueue from "../Queue/embeddingQueue.js";
import { extractAttachments, extractMessageBody, getHeader, getNewUpdates, getStartHistoryId, processEmailData } from "../helper/metaData/email.js";
import e from "express";

const QUEUE_DELAY = 1000 * 60

export async function UpdateEmailData() {
  try {
    const cacheTokenKey = `tokens_${GMAIL_STR}`
    // Retrieve all active users
    //   cache.set(cache_id, MessageNumber, 10);
    let tokens = []
    let user = {}
    let cachedData = await cache.get(cacheTokenKey);
    if ((cachedData || []).length > 0) {
      tokens = cachedData
    } else {
      tokens = await AppToken.find({ state: GMAIL_STR });
      cache.set(cacheTokenKey, tokens, QUEUE_DELAY);
    }

    if (tokens.length > 0) {
      tokens.forEach(async (token) => {
        const user_id = token?.user_id;
        const cacheUserKey = `tokens_${GMAIL_STR}_${user_id}`
        let cachedUserData = await cache.get(cacheUserKey);
        if ((cachedUserData || []).length > 0) {
          user = cachedUserData
        } else {
          user = await User.findById(user_id);
          cache.set(cacheUserKey, user, 100);
        }
        const auth = await authorizeGoogleDrive({
          access_token: token?.access_token,
          refresh_token: token?.refresh_token,
          scope: token?.scope,
          token_type: token?.token_type,
          expiry_date: token?.expiry_date,
        });


        const gmailStartHistoryId = await getStartHistoryId(auth)

        const currentGmailStartHistoryId = token?.gmailStartHistoryId;
        const groupedMessages = {};

        let startToken = currentGmailStartHistoryId || gmailStartHistoryId;
        if (startToken) {
          if (gmailStartHistoryId !== currentGmailStartHistoryId) {
            await AppToken.findOneAndUpdate(
              { user_id, organization: user.organization, state: GMAIL_STR },
              { $set: { gmailStartHistoryId: gmailStartHistoryId } },
              { new: true }
            );

            cache.del(cacheTokenKey)
            const gmailChange = await getNewUpdates(auth, startToken);

            for (const changesMail of gmailChange?.changes || []) {
              if (changesMail?.type === "labelRemoved") {
                for (const item of changesMail?.messages || []) {
                  const threadId = item?.message?.threadId;
                  const processedEmail = await getAllEmailsByThreadId(auth, threadId, user_id);

                  const processedEmailText = await generateEmbeddingText(processedEmail);
                  const metaData = {user_id}
                  embeddingQueue.add({ token, id:threadId, app: GMAIL_STR,text:processedEmailText, metaData }, { jobId: `embedding_${threadId}`, delay: QUEUE_DELAY })
                  .then((job) => console.log(`Job added: ${job.id}`))
                  .catch((err) => console.error('Error adding job to queue:', err));

                  if (!groupedMessages[threadId]) {
                    groupedMessages[threadId] = {
                      doc_id: threadId,
                      email: [],
                    };
                  }
                  groupedMessages[threadId].email.push(processedEmail);
                }
              } else if (changesMail?.type === "added") {
                for (const item of changesMail?.messages || []) {
                  const threadId = item?.message?.threadId;
                  const processedEmail = await getAllEmailsByThreadId(auth, threadId, user_id);
                  const processedEmailText = await generateEmbeddingText(processedEmail);
                  
                  const metaData = {user_id}
                  embeddingQueue.add({ token, id:threadId, app: GMAIL_STR,text:processedEmailText, metaData }, { jobId: `embedding_${threadId}`, delay: QUEUE_DELAY })
                  .then((job) => console.log(`Job added: ${job.id}`))
                  .catch((err) => console.error('Error adding job to queue:', err));

                  
                  if (!groupedMessages[threadId]) {
                    groupedMessages[threadId] = {
                      doc_id: threadId,
                      email: [],
                    };
                  }
                  groupedMessages[threadId].email.push(processedEmail);
                }
              }
            }
            const updated = updateDataInDb(user,groupedMessages)
            if(updated){
              console.log("update Email Success")
            }
          }
        }
      });
    }

    console.log("gamil update func");
  } catch (error) {
    console.error("Error in syncing Google Drive data:", error);
  }
}



/**
 * Fetch all emails using a specific threadId
 * @param {Object} authClient - Authenticated OAuth2 client
 * @param {string} threadId - The thread ID to fetch emails for
 * @returns {Promise<Object[]>} - Returns a list of email data in the thread
 */
export async function getAllEmailsByThreadId(authClient, threadId, user_id) {
  const gmail = google.gmail({ version: "v1", auth: authClient });

  try {
    if (!threadId) {
      console.error("Thread ID is missing in changesMail:", changesMail);
      return;
    }
    const response = await gmail.users.threads.get({
      userId: "me", // Use 'me' to refer to the authenticated user
      id: threadId,
    });

    // console.log(response)
    // Extract messages from the thread response
    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      return []; // No emails in the thread
    }

    // Process each email in the thread
    const emailDataList = await Promise.all(
      messages.map(async (message) => {
        const emailData = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });


        const headers = emailData.data.payload.headers;
        const body = extractMessageBody(emailData.data.payload);
        const labels = emailData.data.labelIds || [];
        const timestamp = emailData.data.internalDate; // Timestamp is in internalDate
        const attachments = extractAttachments(emailData.data.payload);
        const isDeleted = labels.includes("TRASH");

        // Process the email data (e.g., parse headers, body)
        return {
          id: emailData.data.id,
          threadId: emailData.data.threadId,
          Sender: getHeader(headers, "Sender"),
          from: getHeader(headers, "From"),
          to: getHeader(headers, "To"),
          cc: getHeader(headers, "Cc"),
          bcc: getHeader(headers, "Bcc"),
          subject: getHeader(headers, "Subject"),
          snippet: emailData.data.snippet,
          message: body,
          labels: labels,
          attachments: attachments,
          modifiedTime: new Date(parseInt(timestamp)).toISOString(), // Convert timestamp to readable date
          trashed: isDeleted
        };
      })
    );

    return processEmailData(emailDataList, user_id);

  } catch (error) {
    console.error("Error fetching emails by threadId:", error);
    throw error;
  }
}

async function updateDataInDb(user,groupedMessages = {}){
try {
  const user_id = user?._id, organization = user?.organization?._id;

  const bulkOperations = Object.values(groupedMessages).map(group => ({
    updateOne: {
      filter: { doc_id: group.doc_id, user_id, organization },
      update: {
        $set: {
          doc_id: group.doc_id,
          user_id,
          organization,
          data: {
            emails: group.email,
            modifiedTime: (group.email||[])[0]?.modifiedTime,
            thread:(group.email||[]).every((message) =>
              message.labels && message.labels.includes("TRASH")
            )
          },
          app_name: GMAIL_STR,
        },
      },
      upsert: true,
    },
  }));
  await Filedata.bulkWrite(bulkOperations);
  return true
} catch (error) {
  console.log(error)
  return false
}
}



function generateEmbeddingText(processedEmail) {
  const {
      id,
      threadId,
      Sender,
      from,
      to,
      cc,
      bcc,
      subject,
      snippet,
      message,
      labels,
      attachments,
      modifiedTime,
      trashed,
  } = processedEmail;

  return `
Email Metadata:
- ID: ${id || "Unknown"}
- Thread ID: ${threadId || "Unknown"}
- Sender: ${Sender || "Unknown"} (${from || "Unknown"})
- Recipients: ${to && to.length > 0 ? to.join(", ") : "None"}
- CC: ${cc && cc.length > 0 ? cc.join(", ") : "None"}
- BCC: ${bcc && bcc.length > 0 ? bcc.join(", ") : "None"}

Subject and Content:
- Subject: ${subject || "No Subject"}
- Snippet: ${snippet || "No Snippet"}
- Body: ${message || "No Message"}

Labels and Attachments:
- Labels: ${labels && labels.length > 0 ? labels.join(", ") : "No Labels"}
- Attachments: ${
      attachments && attachments.length > 0
          ? attachments.map(a => `${a.name} (${a.mimeType || "Unknown Type"})`).join(", ")
          : "No Attachments"
  }

Other Details:
- Last Modified: ${modifiedTime || "Unknown"}
- Trashed: ${trashed ? "Yes" : "No"}
`.trim();
}
