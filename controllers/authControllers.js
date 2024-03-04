import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { createUser, loginUser } from "../schemas/usersSchemas.js";
import HttpError from "../helpers/HttpError.js";

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

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
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
