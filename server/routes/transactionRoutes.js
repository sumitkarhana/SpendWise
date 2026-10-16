const router = require("express").Router();
const c = require("../controllers/transactionController");
const protect = require("../middleware/auth");
router.use(protect);
// summary and analytics must come before /:id
router.get("/summary", c.summary);
router.get("/analytics", c.analytics);
router.route("/").get(c.list).post(c.create);
router.route("/:id").get(c.getOne).put(c.update).delete(c.remove);
module.exports = router;
