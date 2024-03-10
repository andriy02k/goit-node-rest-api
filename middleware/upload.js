import multer from "multer";
import * as path from "node:path";
import * as crypto from "node:crypto";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(process.cwd(), "tmp"));
  },
  filename(req, file, cb) {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const sufsix = crypto.randomUUID();
    cb(null, `${basename}_${sufsix}${extname}`);
  },
});

export default multer({ storage });
