const router = require("express").Router();
const madrasaController = require("./madrasa.controller");
const authMiddleware = require("../../../middleware/authenticate");
const rbacMiddleware = require("../../../middleware/rbacMiddleware");

// All routes here should be protected and only for Super Admin
// Note: You can uncomment these middlewares once you have a Super Admin user and valid token
router.use(authMiddleware);
router.use(rbacMiddleware(['super_admin']));

router.post("/madrasas", madrasaController.createMadrasa);
router.get("/madrasas", madrasaController.getAllMadrasas);
router.put("/madrasas/:id", madrasaController.updateMadrasa);
router.delete("/madrasas/:id", madrasaController.deleteMadrasa);

module.exports = router;
