import activityData from '../mockData/activities.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let activities = [...activityData];

const activityService = {
  async getAll() {
    await delay(300);
    return [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.Id === parseInt(id, 10));
    if (!activity) {
      throw new Error('Activity not found');
    }
    return { ...activity };
  },

  async create(activityData) {
    await delay(300);
    const newActivity = {
      ...activityData,
      Id: Math.max(...activities.map(a => a.Id), 0) + 1,
      timestamp: new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async getByContactId(contactId) {
    await delay(200);
    return activities
      .filter(a => a.contactId === parseInt(contactId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getByDealId(dealId) {
    await delay(200);
    return activities
      .filter(a => a.dealId === parseInt(dealId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};

export default activityService;