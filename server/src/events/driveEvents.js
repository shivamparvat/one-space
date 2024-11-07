import { google } from "googleapis";
import OrganizationDrive from "./schema/OrganizationDrive.js";

export const registerDriveWatch = async (req, res) => {
  try {
    const { organizationId, webhookUrl } = req.body;

    // Find organization credentials in MongoDB
    const organizationDrive = await OrganizationDrive.findOne({
      organizationId,
    });
    if (!organizationDrive) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const { access_token, refresh_token, scope, token_type, expiry_date } =
      organizationDrive;

    // Set up OAuth2 client with Google Drive credentials
    const authClient = await authorizeGoogleDrive({
      access_token,
      refresh_token,
      scope,
      token_type,
      expiry_date,
    });

    const drive = google.drive({ version: "v3", auth: authClient });

    // Create a unique channel ID for this watch
    const channelId = `channel_${organizationId}_${Date.now()}`;

    // Watch request to monitor file changes
    const watchRequest = {
      pageSize: 10, // Adjust as per requirements
      resource: {
        id: channelId, // Unique channel ID for this subscription
        type: "web_hook",
        address: webhookUrl, // Webhook URL to receive notifications
      },
    };

    // Make API call to set up watch on Drive
    const response = await drive.changes.watch(watchRequest);

    // Save channelId and resourceId in MongoDB for future reference
    organizationDrive.channelId = channelId;
    organizationDrive.resourceId = response.data.resourceId; // Save resourceId for stopping the watch if needed
    organizationDrive.webhookUrl = webhookUrl;
    await organizationDrive.save();

    console.log(
      `Google Drive webhook created for organization ${organizationId}`
    );

    res
      .status(200)
      .json({ success: true, message: "Drive watch registered successfully" });
  } catch (error) {
    console.error(`Error setting up Drive watch: ${error}`);
    res
      .status(500)
      .json({ success: false, message: "Failed to register drive watch" });
  }
};
