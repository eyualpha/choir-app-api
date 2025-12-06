const express = require("express");
const connectDB = require("./config/mongodb");
const cors = require("cors");
const fs = require("fs");
const { resourceRouter } = require("./routes/resource.route");
const { authRouter } = require("./routes/auth.route");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/api/auth", authRouter);
app.use("/api/resources", resourceRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
