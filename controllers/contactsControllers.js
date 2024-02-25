import Contact from "../models/contacts.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from "../schemas/contactsSchemas.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const contactsList = await Contact.find();
    res.send(contactsList);
  } catch (error) {
    next(error);
  }
};
export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (contact === null) {
      next(HttpError(404));
      return;
    }

    res.status(200).send(contact);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (contact === null) {
      next(HttpError(404));
      return;
    }

    res.status(200).send(contact);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const createContact = async (req, res, next) => {
  try {
    const newContact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };
    const { error } = createContactSchema.validate(newContact);

    if (typeof error !== "undefined") {
      next(HttpError(400, error.message));
    }
    const result = await Contact.create(newContact);

    res.status(201).send(result);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    if (
      !updatedContact.name &&
      !updatedContact.email &&
      !updatedContact.phone
    ) {
      next(HttpError(400, "Body must have at least one field"));
    }

    const { error } = updateContactSchema.validate(updatedContact);
    if (typeof error !== "undefined") {
      next(HttpError(400, error.message));
    }

    const result = await Contact.findByIdAndUpdate(id, updatedContact);

    if (result === null) {
      next(HttpError(404));
    }

    res.status(200).send(result);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;

    if (favorite === undefined) {
      next(HttpError(400, "Favorite field is required for update"));
      return;
    }

    const { error } = updateStatusContactSchema.validate({ favorite });
    if (typeof error !== "undefined") {
      next(HttpError(400, error.message));
    }

    const result = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );

    if (result === null) {
      next(HttpError(404));
    }

    res.status(200).send(result);
  } catch (error) {
    next(error).json({ message: "Server error" });
  }
};

// export const updateStatusContact = async (req, res, next) => {
//   try {
//     const { contactId } = req.params;
//     const updateField = {
//       favorite: req.body.favorite,
//     };

//     if (updateField.favorite === undefined) {
//       next(HttpError(400, "Favorite field is required for update"));
//       return;
//     }

//     const { error } = updateStatusContactSchema.validate(updateField);
//     if (typeof error !== "undefined") {
//       next(HttpError(400, error.message));
//     }

//     const result = await Contact.findByIdAndUpdate(
//       contactId,
//       { $set: updateField },
//       { new: true }
//     );

//     if (result === null) {
//       next(HttpError(404));
//     }

//     res.status(200).send(result);
//   } catch (error) {
//     next(error).json({ message: "Server error" });
//   }
// };
