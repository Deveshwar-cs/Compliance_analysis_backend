import {generateToken} from "../../utils/genToken.js";
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

export const signin = async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({message: "All fields are required"});
    }

    const user = await Auth.findOne({email});
    if (!user) {
      return res.status(400).json({message: "User not exists"});
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({message: "Incorrect password"});
    }

    // Token generation
    const token = generateToken(user._id, user.userName, user.role);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successfully",
        data: user._id,
      });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
