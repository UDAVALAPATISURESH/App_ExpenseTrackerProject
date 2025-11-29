const path = require("path");
const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();
const saltRounds = 10;
const API_URL = process.env.APP_URL || "http://localhost:3000";

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.forgotPasswordPage = async (req, res, next) => {
  try {
    res.status(200).sendFile(path.join(__dirname, "../", "public", "views", "forgotPassword.html"));
  } catch (error) {
    console.log(error);
  }
};

exports.sendMail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const requestId = uuidv4();

    // Find user by email
    const recipientUser = await User.findOne({ where: { email: email } });

    if (!recipientUser) {
      return res.status(404).json({ message: "Please provide the registered email!" });
    }

    // Create reset request document
    await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: recipientUser.id,
    });

    // Setup Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${API_URL}/password/resetPasswordPage/${requestId}`;
    
    const mailOptions = {
      from: process.env.SENDER_EMAIL || process.env.EMAIL_USER,
      to: email,
      subject: "Expense Tracker Reset Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #293241;">Password Reset Request</h2>
          <p>Hi,</p>
          <p>We received a request to reset your password for your Expense Tracker account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #293241; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #3d5a80; word-break: break-all;">${resetLink}</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Link for reset the password is successfully sent to your Mail Id!",
    });
  } catch (error) {
    console.log(error);
    return res.status(409).json({ message: "Failed to send password reset email" });
  }
};

exports.resetPasswordPage = async (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, "../", "public", "views", "resetPassword.html"));
  } catch (error) {
    console.log(error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password, requestId } = req.body;

    const resetEntry = await ResetPassword.findOne({ where: { id: requestId, isActive: true } });

    if (!resetEntry) {
      return res.status(409).json({ message: "Link already used or expired!" });
    }

    const hashed = await hashPassword(password);

    // Update user's password
    await User.update({ password: hashed }, { where: { id: resetEntry.userId } });

    // Mark reset request inactive
    await ResetPassword.update({ isActive: false }, { where: { id: requestId } });

    return res.status(200).json({ message: "Successfully changed password!" });
  } catch (err) {
    console.log(err);
    return res.status(409).json({ message: "Failed to change password!" });
  }
};
