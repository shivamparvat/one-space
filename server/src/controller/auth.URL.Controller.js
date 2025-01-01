import { google } from "googleapis";
import AppToken from "../Schema/apptoken.js";
import { Dropbox } from "dropbox";
import fetch from "node-fetch";
import { DROPBOX_STR, GMAIL_STR, GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";
import { fetchUserByToken } from "../middleware/auth.middleware.js";
import { getFilesFromDrive } from "../helper/metaData/drive.js";
import { getEmailsFromGmail } from "../helper/metaData/email.js";

export async function GoogleAuthUrl(req, res) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const authUrl = await oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.metadata.readonly"],
  });

  res.status(200).json({ authUrl });
}

export async function GoogleCallback(req, res) {
  const { code, state: stateJson } = req.query;
  const StateData = stateJson ? JSON.parse(stateJson) : {};
  const appName = StateData?.app
  const user = await fetchUserByToken(res, StateData?.token);

  const user_id = user?._id;
  const organization = user?.organization?._id;

  const hostUrl = `${req.protocol}://${req.get("host")}`;

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oAuth2Client.getToken(code);

    console.log("tokens",tokens)
    // const findToken = await new AppToken.find();

    // if (!findToken) {
    //   return res.redirect("/dashboard");
    // }

    if (appName == GOOGLE_DRIVE_STR) {
      const newAuth = new AppToken({
        user_id,
        organization,
        ...tokens,
        state: GOOGLE_DRIVE_STR,
      });
      await newAuth.save();

      getFilesFromDrive(
        {
          ...tokens,
          state: GOOGLE_DRIVE_STR,
        },
        user_id,
        organization
      );
    } else if (appName == GMAIL_STR) {
      console.log(GMAIL_STR," gkfhg ")
      const newAuth = new AppToken({
        user_id,
        organization,
        ...tokens,
        state: GMAIL_STR,
      });
      await newAuth.save();
      getEmailsFromGmail(
        {
          ...tokens,
          state: GMAIL_STR,
        },
        user_id,
        organization
      );
    }

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    return res.redirect("/dashboard");
  }
}

const config = {
  fetch,
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
};

const dbx = new Dropbox(config);
export async function DropboxAuthUrl(req, res) {
  dbx.auth
    .getAuthenticationUrl(
      process.env.DROPBOX_REDIRECT_URI,
      null,
      "code",
      "offline",
      null,
      "none",
      false
    )
    .then((authUrl) => {
      res.writeHead(302, { Location: authUrl });
      res.end();
    });
}

// {
//   const dbx = new Dropbox({
//     fetch,
//     clientId: process.env.DROPBOX_CLIENT_ID,
//     clientSecret: process.env.DROPBOX_CLIENT_SECRET,
//   });

//   const authUrl = dbx.auth.getAuthenticationUrl(process.env.DROPBOX_REDIRECT_URI, null, 'code', 'offline', null, 'none', false)
//   res.status(200).json({ authUrl });
// }

export async function DropboxCallback(req, res) {
  const { code, state } = req.query;

  try {
    const dbx = new Dropbox({
      fetch,
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
    });

    const response = await dbx.auth.getAccessTokenFromCode(
      process.env.DROPBOX_REDIRECT_URI,
      code
    );

    const { access_token, refresh_token, token_type, scope, expires_in } =
      response.result;

    const newAuth = new AppToken({
      access_token,
      refresh_token,
      token_type,
      scope,
      expiry_date: expires_in,
      state: DROPBOX_STR,
    });

    await newAuth.save();

    return res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    return res.redirect("/dashboard"); // Handle error appropriately
  }
}
