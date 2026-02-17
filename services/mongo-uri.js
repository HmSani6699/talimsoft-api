const ssl_setting = process.env.NODE_ENV === "development" ? false : true;
const args = `?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=${ssl_setting}`;
module.exports = {
  generateMongoDbUri() {
    if (process.env.MONGO_DB_URI) {
      console.log("Using MONGO_DB_URI from environment variables.");
      return process.env.MONGO_DB_URI;
    }

    const ssl_setting = process.env.NODE_ENV && process.env.NODE_ENV.trim() === "development" ? false : true;
    const args = `?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=${ssl_setting}`;
    
    const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}${args}`;
    console.log("Generating connection URI from individual MONGO_ variables.");
    return uri;
  },
};
