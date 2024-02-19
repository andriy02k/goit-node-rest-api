import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  UpToDateContact,
} from "../services/contactsServices.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const contactsList = await listContacts();
    res.status(200).json(contactsList);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);

    if (contact) {
      res.status(200).json(contact);
      return;
    }

    next(HttpError(404));
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await removeContact(id);

    if (contact) {
      res.status(200).json(contact);
      return;
    }

    next(HttpError(404));
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const createContact = async (req, res, next) => {
  try {
    const {
      name = "name",
      email = "name@gamil.com",
      phone = "name",
    } = req.body;
    const { error } = createContactSchema.validate({ name, email, phone });

    if (typeof error !== "undefined") {
      next(HttpError(400, error.message));
    }
    const newContact = await addContact(name, email, phone);

    res.status(201).json(newContact);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    if (!name && !email && !phone) {
      next(HttpError(400, "Body must have at least one field"));
    }

    const { error } = updateContactSchema.validate({ name, email, phone });
    if (typeof error !== "undefined") {
      next(HttpError(400, error.message));
    }

    const contact = await getContactById(id);
    if (!contact) {
      next(HttpError(404));
    }

    const updateContact = await UpToDateContact(id, { name, email, phone });
    res.status(200).json(updateContact);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};
