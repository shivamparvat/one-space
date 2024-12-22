import { createClient } from 'redis';

// Initialize Redis client
// const client = createClient({
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//       host: process.env.REDIS_HOST,
//       port: process.env.REDIS_PORT
//   }
// });
const client = createClient({
  username: 'default',
  password: 'JCCzzIKeUmmwQFUrXKgf0JlMknD6bj8D',
  socket: {
      host: 'redis-19548.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
      port: 19548
  }
});

// Connect to Redis
client.connect().catch(console.error);

client.on("error", err => {
  console.error("Redis Client Error:", err);
});

// Utility functions for caching
const cache = {
  /**
     * 
     * @param {string} key key of data
     * @param {any} value cache data 
     * @param {number} ttl time in second
     */
  async set(key, value, ttl = 3600) {
    // ttl = time-to-live in seconds
    try {
      await client.set(key, JSON.stringify(value), { EX: ttl });
    } catch (err) {
      console.error("Error setting cache:", err);
    }
  },

  /**
   * 
   * @param {string} key data store key
   * @returns any
   */
  async get(key) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error("Error getting cache:", err);
      return null;
    }
  },

  /**
   * 
   * @param {string} key key of data that you wanna delete
   */
  async del(key) {
    try {
      await client.del(key);
      console.log(`Deleted cache for key: ${key}`);
    } catch (err) {
      console.error("Error deleting cache:", err);
    }
  },

  async clearCache() {
    try {
      await client.flushAll();
      console.log("All cache cleared");
    } catch (err) {
      console.error("Error clearing cache:", err);
    }
  }
};

// Export the cache object
export default cache;
