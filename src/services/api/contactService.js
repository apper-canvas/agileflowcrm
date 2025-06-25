import contactData from '../mockData/contacts.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let contacts = [...contactData];

const contactService = {
  async getAll() {
    await delay(300);
    return [...contacts];
  },

  async getById(id) {
    await delay(200);
    const contact = contacts.find(c => c.Id === parseInt(id, 10));
    if (!contact) {
      throw new Error('Contact not found');
    }
    return { ...contact };
  },

  async create(contactData) {
    await delay(300);
    const newContact = {
      ...contactData,
      Id: Math.max(...contacts.map(c => c.Id), 0) + 1,
      createdAt: new Date().toISOString(),
      lastContactedAt: null
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, updates) {
    await delay(300);
    const index = contacts.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Contact not found');
    }
    const { Id, ...updateData } = updates;
    contacts[index] = { ...contacts[index], ...updateData };
    return { ...contacts[index] };
  },

  async delete(id) {
    await delay(300);
    const index = contacts.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Contact not found');
    }
    contacts.splice(index, 1);
    return true;
  },

  async search(query) {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery) ||
      contact.company.toLowerCase().includes(lowerQuery)
    );
  }
};

export default contactService;