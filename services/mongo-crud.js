const { MongoClient, ObjectId } = require("mongodb");

module.exports = {
  async documentCount(db, collection, query = {}) {
    const options = {};
    try {
      const count = await db.collection(collection)
        .countDocuments(query, options);
      return count;
    } catch (e) {
      console.error(e);
      return "error";
    }
  },
  async fetchMany(
    db,
    collection,
    query = {},
    keys = {},
    sorting = {},
    limit = 0,
    pageNumber = 0
  ) {
    // Note limit = 0 is the equivalent of setting no limit
    try {
      const list = await db.collection(collection)
        .find(query)
        .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
        .limit(limit)
        .sort(sorting)
        .project(keys)
        .toArray();
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async fetchOne(db, collection, query = {}, keys = {}, sorting = {}) {
    try {
      if (query._id && typeof query._id === 'string') {
        query._id = new ObjectId(query._id);
      }
      const list = await db.collection(collection)
        .find(query)
        .sort(sorting)
        .limit(1)
        .project(keys)
        .toArray();
      return list && list.length > 0 ? list[0] : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async fetchWithAggregation(db, collection, query = {}, keys = {}, sorting = {},
    limit = 10,
    pageNumber = 0) {
    try {
      const list = await db.collection(collection)
        .aggregate(query)
        .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
        .sort(sorting)
        .limit(limit)
        .project(keys)
        .toArray();
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async fetchUniqueValues(db, collection, field, query) {
    try {
      const vals = await db.collection(collection)
        .distinct(field, query);
      return vals || [];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async isDataExist(db, collection, query) {
    try {
      let result = await db.collection(collection)
        .find(query)
        .toArray();

      return !!result[0];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertOne(db, collection, payload) {
    try {
      const response = await db.collection(collection)
        .insertOne(payload);
      // v4+ returns insertedId, and we need to return the inserted document or at least true/success
      // For compatibility with codebase that expects response.ops[0]:
      return { ...payload, _id: response.insertedId };
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateOne(db, collection, query, payload) {
    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true };
    const updateDoc = {
      $set: payload,
    };
    try {
      if (query._id && typeof query._id === 'string') {
        query._id = new ObjectId(query._id);
      }
      const result = await db.collection(collection)
        .updateOne(query, updateDoc, options);
      return result.matchedCount > 0 || result.upsertedCount > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateOneArray(db, collection, query, payload) {
    const options = {};
    try {
      if (query._id && typeof query._id === 'string') {
        query._id = new ObjectId(query._id);
      }
      const result = await db.collection(collection)
        .updateOne(query, { $push: payload }, options);
      return result.matchedCount > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertMany(db, collection, payload) {
    try {
      const response = await db.collection(collection)
        .insertMany(payload);
      return response.insertedIds;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateData(db, collection, query, newValue) {
    try {
      if (query._id && typeof query._id === 'string') {
        query._id = new ObjectId(query._id);
      }
      let result = await db.collection(collection)
        .updateOne(query, newValue);
      // v4+ uses matchedCount instead of result.n
      return result.matchedCount > 0; 
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteData(db, collection, query) {
    try {
      if (query._id && typeof query._id === 'string') {
        query._id = new ObjectId(query._id);
      }
      let result = await db.collection(collection)
        .deleteOne(query); // Switched from findOneAndDelete to deleteOne for consistency with boolean return
      
      return result.deletedCount > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async documentExists(db, collection, query) {
    try {
      let result =
        (await db.collection(collection)
          .countDocuments(query)) > 0;
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
};
