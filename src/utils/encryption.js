import crypto from "crypto";
import env from "dotenv";
env.config();

const key = process.env.CRYPTO_KEY;
const IV = crypto.randomBytes(16);
function encrypt(text) {
  const buffer = Buffer.from(key);
  const cipher = crypto.createCipheriv("aes-256-cbc", buffer, IV);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return IV.toString("hex") + ":" + encrypted;
}

export default encrypt;
