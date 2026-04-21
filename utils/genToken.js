import jwt from "jsonwebtoken";

export const generateToken = (id, userName, role) => {
  return jwt.sign({id, userName, role}, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
