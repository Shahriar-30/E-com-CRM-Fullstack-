import dotenv from "dotenv";
import { connectDB } from "../src/db/database.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is started at PORT " + process.env.PORT);
    });
  })
  .catch((err) => console.log("Database Connection Faild", err));
