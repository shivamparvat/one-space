export const driveWebhook = async (req, res) => {
  try {
    const resourceId = req.headers["x-goog-resource-id"];
    
    if (resourceId) {
      // Fetch latest metadata using the resource ID
      const fileMetadata = await getFileMetadata(drive, resourceId);
      console.log("File metadata:", fileMetadata);

      const previousMetadata = await getPreviousMetadata(resourceId);

      if (
        fileMetadata.name !== previousMetadata.name ||
        fileMetadata.modifiedTime !== previousMetadata.modifiedTime ||
        fileMetadata.size !== previousMetadata.size ||
        fileMetadata.mimeType !== previousMetadata.mimeType ||
        fileMetadata.permissions !== previousMetadata.permissions
      ) {
        console.log("File metadata has changed");

      }

      if (fileMetadata.md5Checksum !== previousMetadata.md5Checksum) {
        const fileMetadata = await getFileMetadata(drive,resourceId);
      }
    } else {
      console.log("Resource ID not found in headers");
    }

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
