const sessionRoutes = require('../controllers/session.controller');
const userRoutes = require('../controllers/user.controller');
module.exports = (app) => {
    // simple route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to Hive Etherem application." });
    });
    app.use("/session", sessionRoutes);
    app.use("/user", userRoutes);
}