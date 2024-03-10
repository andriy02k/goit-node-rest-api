import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import * as path from "node:path";
import "./db.js";

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/usersRouter.js";
import { auth } from "./middleware/auth.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

// const __filename = new URL(import.meta.url).pathname;
// const __dirname = path.dirname(__filename);
// console.log(__dirname);
// console.log(process.cwd());
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));

app.use("/api/users", authRouter);
app.use("/api/contacts", auth, contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});
