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
  console.log("update")
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
      cache.set(cacheTokenKey, tokens, 100);
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
        // if (user?.ai_permission) {
        const auth = await authorizeGoogleDrive({
          access_token: token?.access_token,
          refresh_token: token?.refresh_token,
          scope: token?.scope,
          token_type: token?.token_type,
          expiry_date: token?.expiry_date,
        });


        const gmailStartHistoryId = await getStartHistoryId(auth)

        const currentGmailStartHistoryId = token?.gmailStartHistoryId;

        let startToken = currentGmailStartHistoryId || gmailStartHistoryId;
        console.log(gmailStartHistoryId, currentGmailStartHistoryId)
        if (startToken) {
          if (gmailStartHistoryId !== currentGmailStartHistoryId) {
            await AppToken.findOneAndUpdate(
              { user_id, organization: user.organization, state: GMAIL_STR },
              { $set: { gmailStartHistoryId: gmailStartHistoryId } },
              { new: true }
            );
            cache.del(cacheTokenKey)

            const gamilChange = await getNewUpdates(auth, startToken);
            console.log(JSON.stringify(gamilChange, null, 2));
            (gamilChange?.changes || []).forEach(async (changesMail) => {
              if (changesMail?.type == "labelRemoved") {
                (changesMail?.labels || []).forEach(async (item) => {
                  const threadId = item?.message?.threadId
                  const result = await getAllEmailsByThreadId(auth, threadId)
                  console.log(result)
                })
              } else if (changesMail?.type == "added") {
                (changesMail?.messages || []).forEach(async (item) => {
                  const threadId = item?.message?.threadId
                  const result = await getAllEmailsByThreadId(auth, threadId)
                  console.log(result)
                })
              }
            })
          }
        }
      });
    }

    console.log("gamil update");
  } catch (error) {
    console.error("Error in syncing Google Drive data:", error);
  }
}



async function getPreviousMetadata(ResourceID, organization, user_id) {
  const prefile = await Filedata.findOne({ doc_id: ResourceID, organization, user_id })
  return prefile?.data
}



/**
 * Fetch all emails using a specific threadId
 * @param {Object} authClient - Authenticated OAuth2 client
 * @param {string} threadId - The thread ID to fetch emails for
 * @returns {Promise<Object[]>} - Returns a list of email data in the thread
 */
export async function getAllEmailsByThreadId(authClient, threadId) {
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

    return processEmailData(emailDataList);

  } catch (error) {
    console.error("Error fetching emails by threadId:", error);
    throw error;
  }
}