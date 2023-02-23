import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
// const authMiddleware = async (req, res, next) => {
//   const token =
//     req.headers["x-access-token"] ||
//     (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
//       ? req.headers.authorization.split(" ")[1]
//       : null);
//   if (!token)
//     return res
//       .status(403)
//       .json({ error: true, message: "Access Denied: No token provided" });

//   try {
//     const tokenDetails = jwt.verify(
//       token,
//       process.env.ACCESS_TOKEN_PRIVATE_KEY
//     );
//     req.user = tokenDetails;
//     next();
//   } catch (err) {
//     return res
//       .status(401)
//       .json({ error: true, message: "Access Denied: Invalid token" });
//   }
// };

const authMiddleware = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(403)
      .json({ error: true, message: "Access Denied: No token provided" });
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedData;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: true, message: "Access Denied: Invalid token" });
  }
};
export default authMiddleware;
