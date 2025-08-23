import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();
const key = process.env.SECRET_KEY;
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  try {
    if (!token) return res.status(401).json({ message: `Token not provided` });
    const decoded = jwt.verify(token, key);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export const validationAdmin = (req, res, next) => {
  if (req.user.role == "Admin") {
    next();
  } else {
    return res.status(401).json({ message: `you 're not auhorizated` });
  }
};
export default verifyToken;
