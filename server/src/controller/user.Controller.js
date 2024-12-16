import { OAuth2Client } from "google-auth-library";
import User from "../Schema/userSchema.js";
import { compareHash, signJwt } from "../utils/Jwt.js";
import { initEmbedding } from "./AI.Controller.js";

const client = new OAuth2Client();

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let picture,
      first_name,
      last_name,
      email_verified = false;
    const authorization = req.headers.authorization;
    let loggedInWith = "";

    console.log(authorization, "authorization");
    // Handle Google login
    if (authorization) {
      try {
        const token = authorization.split(" ")[1];
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        email = payload.email;
        picture = payload.picture;
        first_name = payload.given_name;
        last_name = payload.family_name;
        email_verified = payload.email_verified;
        loggedInWith = "google";

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Invalid Google token"
        });
      }
    } else {
      // Manual validation for email and password
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      loggedInWith = "username-password";
    }

    try {
      // Find user in database
      let findUser = await User.findOne({ email });
      if (!findUser) {
        if (loggedInWith === "google") {
          // Register new user for Google login
          const newUser = new User({
            email,
            first_name: first_name || "",
            last_name: last_name || "",
            image: picture || ""
          });
          findUser = await newUser.save();
        } else {
          return res.status(404).json({
            success: false,
            message: "Email does not exist"
          });
        }
      }

      // Check user status
      if (!findUser.is_active) {
        return res.status(403).json({
          success: false,
          message: "Account is inactive"
        });
      }

      if (findUser.is_deleted) {
        return res.status(403).json({
          success: false,
          message: "Account is deleted"
        });
      }

      // Handle username-password login
      if (loggedInWith === "username-password") {
        const comparePassword = await compareHash(password, findUser.password);

        if (!comparePassword) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password"
          });
        }
      }

      
      // Generate JWT token
      const payLoad = {
        user_id: findUser._id,
        email: findUser.email,
        image: findUser.image || "/assets/logo.png",
        loggedInWith: loggedInWith,
        first_name: findUser.first_name,
        last_name: findUser.last_name,
        contact_number: findUser.contact_number,
        role: findUser.role,
        is_active: findUser.is_active,
        ai_permission: findUser.ai_permission,
        organization: findUser.organization
      };

      const jwtToken = await signJwt(payLoad);

      // Respond with success
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: jwtToken,
        user: payLoad
      });
    } catch (error) {
      console.error("Error processing login:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred"
    });
  }
};


export const permission = async (req, res) => {
  try {
    // Set up the SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const userDetails = req.user;
    const userId = userDetails?._id;

    // Notify client: Starting the process
    res.write(`data: ${JSON.stringify({ status: "info", message: "Initializing permission check..." })}\n\n`);

    // Find the user and check their current ai_permission status
    const user = await User.findById(userId);

    if (!user) {
      res.write(`data: ${JSON.stringify({ success: false, message: "User not found." })}\n\n`);
      res.end();
      return;
    }

    if (user.ai_permission) {
      res.write(`data: ${JSON.stringify({ success: false, message: "AI permission is already enabled." })}\n\n`);
      res.end();
      return;
    }

    // Notify client: Updating permission
    res.write(`data: ${JSON.stringify({ status: "info", message: "Updating AI permissions..." })}\n\n`);

    // Call the initEmbedding function and pass streaming updates
    await initEmbedding(req, res, true);

    // Update ai_permission to true
    // user.ai_permission = true;
    // await user.save();

    // Notify client: Permission updated successfully
    res.write(
      `data: ${JSON.stringify({
        success: true,
        message: "AI permission updated successfully.",
        user,
      })}\n\n`
    );

    // Close the SSE connection
    res.end();
  } catch (error) {
    console.error("Error updating AI permission:", error);

    // Notify client: Error occurred
    res.write(
      `data: ${JSON.stringify({
        success: false,
        message: "An error occurred while updating AI permission.",
        error: error.message,
      })}\n\n`
    );

    res.end();
  }
};


export const updatedUser = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "updated user", user: req.user });
  } catch(error) {
    return res.status(500).json({ success: false, message: "something went wrong", error });
  }
}