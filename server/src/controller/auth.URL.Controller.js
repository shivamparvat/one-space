import { google } from "googleapis";
import AppToken from "../Schema/apptoken.js";

export async function GoogleAuthUrl(req, res) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const authUrl = await oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.metadata.readonly"]
  });

  res.status(200).json({ authUrl });
}

export async function GoogleCallback(req, res) {
  const { code } = req.query;

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oAuth2Client.getToken(code);

    const newAuth = new AppToken({...tokens,state:"Google Drive"
    });
    await newAuth.save();

    return res.redirect("/dashboard"); // Change this to your desired redirect URL
  } catch (error) {
  console.log(error)
    return res.redirect("/dashboard");
  }
}
