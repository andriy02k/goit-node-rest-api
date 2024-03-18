import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const auth = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (typeof authorizationHeader === "undefined") {
    return res.status(401).send({ message: "Not authorized" });
  }

  const [bearer, token] = authorizationHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({ message: "Token Expired" });
      }
      return res.status(401).send({ message: "Not authorized" });
    }

    const user = await User.findById(decode.id);

    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }

    if (user.token !== token) {
      return res.status(401).send({ message: "Not authorized" });
    }

    if (user.verify === false) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    req.user = {
      id: decode.id,
      name: decode.name,
    };

    next();
  });
};
