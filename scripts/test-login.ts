import "dotenv/config";
import { login } from "../src/services/auth.service";

login({ username: "ahmet_yilmaz", password: "Password123!" })
  .then((result) => console.log("LOGIN OK:", result.user.username))
  .catch((error) => console.error("LOGIN FAIL:", error));
