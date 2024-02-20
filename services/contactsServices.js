import { nanoid } from "nanoid";
import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const contactsPath = join(dirname(__dirname), "db", "contacts.json");

async function listContacts() {
  try {
    const data = await readFile(contactsPath, { encoding: "utf-8" });
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts();
    return contacts.find((item) => item.id === contactId) || null;
  } catch (error) {
    throw error;
  }
}

async function removeContact(contactId) {
  try {
    const contacts = await listContacts();

    const idx = contacts.findIndex((item) => item.id === contactId);
    if (idx === -1) return null;

    const [removedContact] = contacts.splice(idx, 1);
    await writeFile(contactsPath, JSON.stringify(contacts));
    return removedContact;
  } catch (error) {
    throw error;
  }
}

async function addContact(name, email, phone) {
  try {
    const contacts = await listContacts();
    const newContact = { id: nanoid(), name, email, phone };

    contacts.push(newContact);
    await writeFile(contactsPath, JSON.stringify(contacts));

    return newContact;
  } catch (error) {
    throw error;
  }
}

async function UpToDateContact(id, news) {
  try {
    const contacts = await listContacts();
    console.log(contacts);
    const idx = contacts.findIndex((el) => el.id === id);
    console.log(idx);

    if (idx === -1) return null;
    console.log(contacts[idx]);
    contacts[idx] = { ...contacts[idx], ...news };
    console.log(contacts);
    await writeFile(contactsPath, JSON.stringify(contacts));
    console.log(contacts[idx]);

    return contacts[idx];
  } catch (error) {
    throw error;
  }
}

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  UpToDateContact,
};
