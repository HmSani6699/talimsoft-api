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
    key = {},
    sorting = {},
    limit = 0,
    pageNumber = 0
  ) {
    // Note limit = 0 is the equivalent of setting no limit
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .find(query)
        .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
        .limit(limit)
        .sort(sorting)
        .project(keys)
        .toArray();
      return list;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async fetchOne(db, collection, query = {}, key = {}, sorting = {}) {
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .find(query)
        .sort(sorting)
        .limit(1)
        .project(keys)
        .toArray();
      return list.length > 0 ? list[0] : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async fetchWithAggregation(db, collection, query = {}, key = {}, sorting = { createdAt: -1 },
    limit = 10,
    pageNumber = 0) {
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .aggregate(query)
        .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
        .sort(sorting)
        .limit(limit)
        .project(keys)
        .toArray();
      return list;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async insertOne(db, collection, payload) {
    try {
      payload.createdAt = Date.now();
      let result = false;
      const response = await db.collection(collection)
        .insertOne(payload);
      if (response.acknowledged) result = { _id: response.insertedId, ...payload };
      return result;
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
      await db.collection(collection)
        .updateOne(query, updateDoc, options);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateOneArray(db, collection, query, payload) {
    const options = {};
    try {
      await db.collection(collection)
        .updateOne(query, { $push: payload }, options);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertMany(db, collection, payload) {
    try {
      let result = false;
      const response = await db.collection(collection)
        .insertMany(payload);
      if (response.insertedCount > 0) result = payload;
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateData(db, collection, query, newValue) {
    try {
      let result = await db.collection(collection)
        .updateOne(query, newValue);
      return !!result.modifiedCount; // for returning boolean value of if updated or not
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateManyData(db, collection, query, newValue) {
    try {
      let result = await db.collection(collection).updateMany(query, newValue);
      return !!result.modifiedCount;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteData(db, collection, query) {
    try {
      let result = await db.collection(collection)
        .findOneAndDelete(query);

      return !!result; // for returning boolean value of if deleted or not
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async transaction(operations, client) {
    const session = client.startSession();
    const transactionOptions = {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    };
    // console.log(operations, session)
    try {
      let result = [];
      await session.withTransaction(async () => {
        for (let { operation, operationParameter } of operations) {
          const operationResult = await operation(...operationParameter, { session })
          if (!operationResult) {
            await session.abortTransaction();
            throw new Error("Something wrong!")
          }
          result = result.concat(operationResult)
        };
      }, transactionOptions);
      return result;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      await session.endSession();
    }
  },
  async documentExists(db, collection, query) {
    try {
      let result = await db.collection(collection)
        .countDocuments(query, {});
      return result > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteMany(db, collection, query) {
    const result = await db.collection(collection)
      .deleteMany(query);
    return result > 0;
  }
};
