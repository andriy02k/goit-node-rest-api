import express from "express";
import {
  register,
  login,
  logout,
  uploadAvatar,
} from "../controllers/authControllers.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const usersRouter = express.Router();

usersRouter.post("/register", register);

usersRouter.post("/login", login);

usersRouter.get("/logout", auth, logout);

usersRouter.patch("/avatar", auth, upload.single("avatar"), uploadAvatar);

export default usersRouter;
