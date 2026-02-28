const root = require("app-root-path");
const mongoConnect = require(`${root}/services/mongo-connect`);
const authService = require(`${root}/services/auth.service`);

const madrasaController = {
  createMadrasa: async (req, res) => {
    const { madrasaName, address, adminName, adminEmail, adminPassword } = req.body;

    // Validation
    if (!madrasaName || !adminEmail || !adminPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Madrasa Name, Admin Email, and Admin Password are required." 
      });
    }

    const { db, client } = await mongoConnect();
    const session = client.startSession();

    try {
      session.startTransaction();

      // 1. Check if Admin Email already exists
      const existingUser = await db.collection("users").findOne({ email: adminEmail }, { session });
      if (existingUser) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "User with this email already exists." });
      }

      // 2. Create Madrasa
      const madrasaPayload = {
        name: madrasaName,
        address: address || "",
        contact_email: adminEmail,
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      };

      const madrasaResult = await db.collection("madrasas").insertOne(madrasaPayload, { session });
      const madrasaId = madrasaResult.insertedId;

      // 3. Create Admin User
      const hashedPassword = await authService.hashPassword(adminPassword);
      const userPayload = {
        username: adminEmail, // Use email as username mostly for admins
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        madrasa_id: madrasaId,
        created_at: new Date(),
        updated_at: new Date()
      };

      const userResult = await db.collection("users").insertOne(userPayload, { session });

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: "Madrasa and Admin created successfully.",
        data: {
          madrasaId: madrasaId,
          adminId: userResult.insertedId,
          madrasaName: madrasaName
        }
      });

    } catch (error) {
      console.error("Create Madrasa Error:", error);
      await session.abortTransaction();
      res.status(500).json({ success: false, message: "Internal server error." });
    } finally {
      session.endSession();
      // client.close();
    }
  },

  getAllMadrasas: async (req, res) => {
    const { db, client } = await mongoConnect();
    try {
      const madrasas = await db.collection("madrasas").find().toArray();
      res.status(200).json({ success: true, data: madrasas });
    } catch (error) {
      console.error("Get All Madrasas Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
      // client.close();
    }
  },

  updateMadrasa: async (req, res) => {
    const { id } = req.params;
    const { name, address, status, plan } = req.body;
    const { db, client } = await mongoConnect();
    try {
      const updateData = {
        updated_at: new Date()
      };
      if (name) updateData.name = name;
      if (address) updateData.address = address;
      if (status) updateData.status = status;
      if (plan) updateData.plan = plan;

      const result = await db.collection("madrasas").findOneAndUpdate(
        { _id: require("mongodb").ObjectId(id) },
        { $set: updateData },
        { returnOriginal: false }
      );

      if (!result.value) {
        return res.status(404).json({ success: false, message: "Madrasa not found" });
      }

      res.status(200).json({ success: true, message: "Madrasa updated successfully", data: result.value });
    } catch (error) {
      console.error("Update Madrasa Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
      // client.close();
    }
  },

  deleteMadrasa: async (req, res) => {
    const { id } = req.params;
    const { db, client } = await mongoConnect();
    const session = client.startSession();
    try {
      session.startTransaction();
      
      const madrasaId = require("mongodb").ObjectId(id);

      // 1. Delete the Madrasa
      const madrasaResult = await db.collection("madrasas").deleteOne({ _id: madrasaId }, { session });
      if (madrasaResult.deletedCount === 0) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, message: "Madrasa not found" });
      }

      // 2. Delete all Users associated with this Madrasa
      await db.collection("users").deleteMany({ madrasa_id: madrasaId }, { session });

      await session.commitTransaction();
      res.status(200).json({ success: true, message: "Madrasa and associated users deleted successfully" });
    } catch (error) {
      console.error("Delete Madrasa Error:", error);
      await session.abortTransaction();
      res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
      session.endSession();
      // client.close();
    }
  }
};

module.exports = madrasaController;
