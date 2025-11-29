const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require("sib-api-v3-sdk");
const dotenv = require("dotenv");
dotenv.config();

function generateAccessToken(id, email) {
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY is not set in environment variables');
  }
  return jwt.sign({ userId: id, email: email }, process.env.SECRET_KEY);
}

const isPremiumUser = (req, res, next) => {
  if (req.user.isPremiumUser) {
    return res.json({ isPremiumUser: true });
  } else {
    return res.json({ isPremiumUser: false });
  }
};

const getLoginPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
};

const postUserSignUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ where: { email: email } });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "User Created Successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const postUserLogin = async (req, res, next) => {
  const { loginEmail, loginPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email: loginEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't Exist!",
      });
    }

    const passwordMatch = await bcrypt.compare(loginPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password Incorrect!",
      });
    }

    const token = generateAccessToken(user.id, user.email);
    res.status(200).json({
      success: true,
      message: "Login Successful!",
      token: token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Something went wrong!",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

module.exports = {
  generateAccessToken,
  getLoginPage,
  postUserLogin,
  postUserSignUp,
  isPremiumUser,
};