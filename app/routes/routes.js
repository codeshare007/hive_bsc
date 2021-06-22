const walletRoutes = require('../controllers/wallet.controller');
module.exports = (app) => {
    // simple route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to Hive Etherem application." });
    });
    app.use("/wallet", walletRoutes);
}