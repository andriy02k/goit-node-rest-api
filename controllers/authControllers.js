import "dotenv/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import jimp from "jimp";
import nodemailer from "nodemailer";
import User from "../models/users.js";
import { createUser, loginUser } from "../schemas/usersSchemas.js";
import HttpError from "../helpers/HttpError.js";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const { error } = createUser.validate(req.body);
  if (typeof error !== "undefined") {
    next(HttpError(400, error.message));
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user !== null) {
      return res.status(409).send({ message: "User already registered" });
    }

    const avatarURL = gravatar.url(normalizedEmail, {
      s: "200",
      r: "pg",
      d: "404",
    });
    const passwordHash = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomUUID();

    await transport.sendMail({
      to: normalizedEmail,
      from: "krainyk02@gmail.com",
      subject: "Welcome to phonebook!",
      html: `To confirm you registration, please click on the <a href="http://localhost:3000/api/users/verify/${verifyToken}">link</a>`,
      text: `To confirm you registration, please open the link http://localhost:3000/api/users/verify/${verifyToken}`,
    });

    await User.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
      avatarURL,
      verifyToken,
      verify: true, //removed
    });

    res.status(201).send({ message: "Registration successfully" });
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const { error } = loginUser.validate(req.body);
  if (typeof error !== "undefined") {
    next(HttpError(400, error.message));
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("Email");
      return res
        .status(401)
        .send({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    if (user.verify === false) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: 3600 }
    );

    await User.findByIdAndUpdate(user._id, { token });

    res.send({ token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });

    res.status(204).send({ message: "No Content" }).end();
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public/avatars",
      req.file.filename
    );

    await fs.rename(req.file.path, filePath);

    const image = await jimp.read(filePath);
    await image.resize(250, 250);
    await image.write(filePath);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: req.file.filename },
      { new: true }
    );

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  const { verifyToken } = req.params;

  try {
    const user = await User.findOne({ verifyToken });

    if (user === null) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verifyToken: null });

    res.send({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

export const resend = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "missing required field email" });
  }
  try {
    const user = await User.findOne({ email });

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }

    const verifyToken = user.verifyToken;

    await transport.sendMail({
      to: email,
      from: "krainyk02@gmail.com",
      subject: "Welcome to phonebook!",
      html: `To confirm you registration, please click on the <a href="http://localhost:3000/api/users/verify/${verifyToken}">link</a>`,
      text: `To confirm you registration, please open the link http://localhost:3000/api/users/verify/${verifyToken}`,
    });

    res.status(200).send({ message: "Verification email has been resent" });
  } catch (error) {
    next(error);
  }
};
