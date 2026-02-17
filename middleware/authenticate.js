var admin = require("firebase-admin");

// Only initialize Firebase if credentials are provided
let firebaseInitialized = false;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
    });
    firebaseInitialized = true;
    console.log("Firebase authentication initialized");
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
    console.warn("Server will run without Firebase authentication");
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT not configured - Firebase authentication disabled");
}

const authRoute = async (req, res, next) => {
  // Skip authentication if Firebase is not initialized
  if (!firebaseInitialized) {
    console.warn("Authentication skipped - Firebase not initialized");
    return next();
  }

  if (req.headers?.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // verify user token
      const decodedUser = await admin.auth().verifyIdToken(token);
      const email = decodedUser.email
      const userId = decodedUser.uid
      if (!email) {
        throw new Error("No email found in decoded user");
      } if (!userId) {
        throw new Error("No userId found in decoded user");
      }
      req.headers.user = {
        email,
        userId
      }
      next();
    } catch (err) {
      return res.status(403).send({ error: "Not Authorized", message: err.message });
    }
  } else {
    return res.status(401).send({ error: "Not Authorized", message: "No auth header found" });
  }
};
module.exports = authRoute;
