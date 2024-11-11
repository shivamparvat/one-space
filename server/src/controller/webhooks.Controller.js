export const driveWebhook = async (req, res) => {
  try {
    // Extract the resource ID from headers
    const resourceId = req.headers["x-goog-resource-id"];
    console.log("Received change notification for resource ID:", resourceId);
    

    // Fetch metadata using the resource ID
    if (resourceId) {
      const fileMetadata = await getFileMetadata(drive,resourceId);
      console.log("File metadata:", fileMetadata);
    } else {
      console.log("Resource ID not found in headers");
    }

    // Acknowledge receipt of the webhook notification
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};


async function getFileMetadata(drive, resourceId) {
  try {
    const response = await drive.files.get({
      fileId: resourceId,
      fields: "*" // Adjust fields as needed
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    throw error;
  }
}
