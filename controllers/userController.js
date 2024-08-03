const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const result = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, role, verificationToken]
    );

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      "Email Verification",
      `Please verify your email by clicking on the following link: ${verificationUrl}`
    );

    res
      .status(201)
      .json({ message: "User registered. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log(token);

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE verification_token = ?",
      [token]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const user = result[0];

    await db.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    if (!user.is_verified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role === "customer") {
      return res
        .status(403)
        .json({ message: "You are not allowed to login from here" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
