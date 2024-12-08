import JWT from "jsonwebtoken";
import User from "../Schema/userSchema.js";

export const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  // Check if the Authorization header is present
  if (!authorization) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  // Extract the token from the header
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    // Decode and verify the token
    const decoded = JWT.decode(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const authData = await JWT.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    // Check if the token is expired
    const todayDate = new Date().getTime();
    if (authData.exp < todayDate / 1000) {
      return res.status(401).json({ error: "Token has expired" });
    }


    // Find the user in the database for validation
    const user = await User.findById(authData?.user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    // Remove the authorization header for security purposes
    delete req?.headers?.authorization;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle any errors during token verification or user retrieval
    return res.status(403).json({ error: "Unauthorized access", details: err.message });
  }
};


