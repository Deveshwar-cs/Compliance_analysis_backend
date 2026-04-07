import {Auth} from "../models/auth.schema.js";

export const signUp = async (req, res, next) => {
  try {
    const {userName, email, password, role} = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({message: "All fields are required"});
    }

    const userExist = await Auth.findOne({email: email});
    if (userExist) {
      return res.status(400).json({message: "User already exists"});
    }

    const user = await Auth.create({
      userName,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      data: user._id,
    });
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};
