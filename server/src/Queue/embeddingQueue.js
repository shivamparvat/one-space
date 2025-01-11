import Bull from "bull";
import { createGmailEmbedding, createGoolgeDriveEmbedding } from "../helper/Embedding.js";
import { authorizeGoogleDrive } from "../helper/metaData/drive.js";
import { GMAIL_STR, GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";

// const embeddingQueue = new Bull("embeddingQueue", {
//     redis: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT,
//         password: process.env.REDIS_PASSWORD, // Add password for authentication
//         tls: {}, // Enable TLS for secure connections
//       },
// });

const embeddingQueue = new Bull("embeddingQueue", {
    redis: {
        host: "redis-19548.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
        port: "19548",
        password: "JCCzzIKeUmmwQFUrXKgf0JlMknD6bj8D" // Add password for authentication
    }
});

// Process the queue
embeddingQueue.process(async job => {
    const { token, id, app, text, metaData } = job.data;
    try {
        console.log(`Started processing job with ID: ${job.id}`);
        if (app == GOOGLE_DRIVE_STR || app == GMAIL_STR) {
            const auth = await authorizeGoogleDrive({
                access_token: token?.access_token,
                refresh_token: token?.refresh_token,
                scope: token?.scope,
                token_type: token?.token_type,
                expiry_date: token?.expiry_date,
            });
            if (app == GOOGLE_DRIVE_STR) {
                await createGoolgeDriveEmbedding(auth, id);
            } else if (app == GMAIL_STR) {
                await createGmailEmbedding(text, {id,...metaData});
            }
        }
        console.log(`Embedding created for file ID: ${id}`);
    } catch (error) {
        console.error(`Error creating embedding for file ID: ${id}`, error);
    }
});

embeddingQueue.on("waiting", jobId => {
    console.log(`Job ${jobId} is waiting.`);
});

embeddingQueue.on("active", jobId => {
    console.log(`Job ${jobId} is now active and being processed.`);
});

embeddingQueue.on("completed", job => {
    job
        .remove()
        .then(() => {
            console.log(`Job ${job.id} removed from the queue after completion.`);
        })
        .catch(err => {
            console.error(`Failed to remove job ${job.id}:`, err);
        });
});

embeddingQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error:`, err);
});

embeddingQueue.on("error", error => {
    console.error("Bull Queue Error:", error);
});

export default embeddingQueue;
