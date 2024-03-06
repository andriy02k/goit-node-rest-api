import express from "express";
import { register, login, logout } from "../controllers/authControllers.js";
import { auth } from "../middleware/auth.js";

const usersRouter = express.Router();

usersRouter.post("/register", register);

usersRouter.post("/login", login);

usersRouter.get("/logout", auth, logout);

export default usersRouter;
