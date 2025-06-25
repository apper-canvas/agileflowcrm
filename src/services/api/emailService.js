import emailData from '../mockData/emails.json';
import contactService from './contactService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let emails = [...emailData];

const emailService = {
  async getAll() {
    await delay(300);
    return [...emails].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(200);
    const email = emails.find(e => e.Id === parseInt(id, 10));
    if (!email) {
      throw new Error('Email not found');
    }
    return { ...email };
  },

  async getByThreadId(threadId) {
    await delay(200);
    return emails
      .filter(e => e.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(e => ({ ...e }));
  },

  async getThreads() {
    await delay(300);
    const threads = new Map();
    
    emails.forEach(email => {
      if (!threads.has(email.threadId)) {
        threads.set(email.threadId, {
          threadId: email.threadId,
          subject: email.subject.replace(/^RE:\s*/i, '').replace(/^FW:\s*/i, ''),
          lastMessage: email,
          messageCount: 0,
          participants: new Set(),
          isRead: true,
          isStarred: false,
          priority: 'normal'
        });
      }
      
      const thread = threads.get(email.threadId);
      thread.messageCount++;
      thread.participants.add(email.from);
      email.to.forEach(recipient => thread.participants.add(recipient));
      
      if (new Date(email.createdAt) > new Date(thread.lastMessage.createdAt)) {
        thread.lastMessage = email;
      }
      
      if (!email.isRead) thread.isRead = false;
      if (email.isStarred) thread.isStarred = true;
      if (email.priority === 'high') thread.priority = 'high';
    });

    return Array.from(threads.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
      .map(thread => ({
        ...thread,
        participants: Array.from(thread.participants)
      }));
  },

  async create(emailData) {
    await delay(400);
    
    // Try to associate with existing contact
    let contactId = null;
    const recipientEmail = emailData.to[0];
    if (recipientEmail) {
      try {
        const contact = await contactService.searchByEmail(recipientEmail);
        if (contact) {
          contactId = contact.Id;
        }
      } catch (error) {
        console.warn('Could not find contact for email:', recipientEmail);
      }
    }

    const newEmail = {
      ...emailData,
      Id: Math.max(...emails.map(e => e.Id), 0) + 1,
      threadId: emailData.threadId || `thread_${Date.now()}`,
      isRead: true,
      isStarred: false,
      contactId,
      priority: emailData.priority || 'normal',
      createdAt: new Date().toISOString(),
      attachments: emailData.attachments || []
    };
    
    emails.push(newEmail);
    return { ...newEmail };
  },

  async update(id, updates) {
    await delay(300);
    const index = emails.findIndex(e => e.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Email not found');
    }
    
    const { Id, ...updateData } = updates;
    emails[index] = { ...emails[index], ...updateData };
    return { ...emails[index] };
  },

  async delete(id) {
    await delay(300);
    const index = emails.findIndex(e => e.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Email not found');
    }
    
    emails.splice(index, 1);
    return true;
  },

  async markAsRead(id) {
    return this.update(id, { isRead: true });
  },

  async markAsUnread(id) {
    return this.update(id, { isRead: false });
  },

  async toggleStar(id) {
    const email = await this.getById(id);
    return this.update(id, { isStarred: !email.isStarred });
  },

  async search(query) {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    return emails.filter(email =>
      email.subject.toLowerCase().includes(lowerQuery) ||
      email.body.toLowerCase().includes(lowerQuery) ||
      email.from.toLowerCase().includes(lowerQuery) ||
      email.to.some(recipient => recipient.toLowerCase().includes(lowerQuery))
    );
  }
};

export default emailService;