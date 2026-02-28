module.exports = {
  generateMongoDbUri() {
    if (process.env.MONGO_DB_URI) {
      console.log("Using MONGO_DB_URI from environment variables.");
      return process.env.MONGO_DB_URI;
    }

    const ssl_setting = process.env.NODE_ENV && process.env.NODE_ENV.trim() === "development" ? "false" : "true";
    // Modern Atlas connection strings usually don't need these extra args if correctly formatted
    const args = `?authSource=admin&readPreference=primary&ssl=${ssl_setting}`;
    
    let host = process.env.MONGO_HOST;
    // If it's an Atlas cluster, we usually use +srv or don't need explicit port if it's already in host
    const protocol = host && host.includes('cluster') ? 'mongodb+srv' : 'mongodb';
    
    const uri = `${protocol}://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${host}/${process.env.MONGO_DB}${args}`;
    console.log(`Generating connection URI from individual MONGO_ variables using ${protocol} protocol.`);
    return uri;
  },
};
