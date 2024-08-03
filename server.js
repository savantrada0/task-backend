const app = require("./app");
const PORT = process.env.PORT || 5000;
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
