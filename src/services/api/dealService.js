import dealData from '../mockData/deals.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let deals = [...dealData];

const dealService = {
  async getAll() {
    await delay(300);
    return [...deals];
  },

  async getById(id) {
    await delay(200);
    const deal = deals.find(d => d.Id === parseInt(id, 10));
    if (!deal) {
      throw new Error('Deal not found');
    }
    return { ...deal };
  },

  async create(dealData) {
    await delay(300);
    const newDeal = {
      ...dealData,
      Id: Math.max(...deals.map(d => d.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, updates) {
    await delay(300);
    const index = deals.findIndex(d => d.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Deal not found');
    }
    const { Id, ...updateData } = updates;
    deals[index] = { ...deals[index], ...updateData };
    return { ...deals[index] };
  },

  async delete(id) {
    await delay(300);
    const index = deals.findIndex(d => d.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Deal not found');
    }
    deals.splice(index, 1);
    return true;
  },

  async updateStage(id, newStage) {
    await delay(200);
    const index = deals.findIndex(d => d.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Deal not found');
    }
    deals[index].stage = newStage;
    return { ...deals[index] };
  }
};

export default dealService;