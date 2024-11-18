import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
/**
 * Compare a plaintext password with a hashed password.
 * @param {string} plainPassword - The plaintext password.
 * @param {string} hashedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} - Returns true if the passwords match, false otherwise.
 */
export const compareHash = async (plainPassword, hashedPassword) => {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error comparing hash:", error);
    throw new Error("Failed to compare password hash");
  }
};

/**
 * Sign a JWT for the given payload.
 * @param {object} payload - The payload to include in the JWT.
 * @param {object} [options={}] - Additional options for signing the JWT (e.g., expiration).
 * @param {string} [secret=process.env.JWT_SECRET] - The secret key for signing the JWT.
 * @returns {Promise<string>} - A signed JWT token.
 */
export const signJwt = (
  payload,
  options = { expiresIn: "1h" },
  secret = process.env.JWT_SECRET,
) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error("Error signing JWT:", err);
        return reject(new Error("Failed to generate token"));
      }
      resolve(token);
    });
  });
};

