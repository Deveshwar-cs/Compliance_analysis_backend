import jwt from "jsonwebtoken";

export const generateToken = (id, userName) => {
  return jwt.sign({id, userName}, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
