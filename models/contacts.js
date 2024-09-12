import { Schema, model } from "mongoose";

const contactsSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    // required: true,
    ref: "user",
  },
});

export default model("Contact", contactsSchema);
