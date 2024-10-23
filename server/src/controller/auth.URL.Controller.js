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

  console.log(code)
  try {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost"
  );
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error("Error retrieving access token", err);

    console.log(err,token)
  })
    const { tokens } = await oAuth2Client.getToken(code);

    console.log(tokens)
    const {
      access_token,
      refresh_token,
      scope,
      token_type,
      expiry_date
    } = tokens;

    const newAuth = new AppToken({
      access_token,
      refresh_token,
      scope,
      token_type,
      expiry_date
    });
    await newAuth.save();

    return res.redirect("/dashboard"); // Change this to your desired redirect URL
  } catch (error) {
    return res.redirect("/dashboard");
  }
}
