const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/userRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", authRoutes);

module.exports = app;
