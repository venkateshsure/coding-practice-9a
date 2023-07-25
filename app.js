const express = require("express");

const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const sqlite = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const filePath = path.join(__dirname, "userData.db");

let db = null;

const dbConObj = async () => {
  try {
    db = await sqlite.open({ filename: filePath, driver: sqlite3.Database });
  } catch (e) {
    console.log(e.message);
  }
};

dbConObj();

app.listen(3000, () => {
  console.log("Server is running");
});

//get api call

app.get("/register", async (req, res) => {
  //const { username, name, password, gender, location } = req.body;
  const query = `
        SELECT * FROM user WHERE name='Adam Richard';`;
  const response = await db.all(query);
  res.send(response);
});

//api call to register

app.post("/register", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let query = `
        select * from user
         where username='${username}';`;
  const response = await db.get(query); //difference between  get and all
  console.log(response);
  if (response === undefined) {
    const createUser = `
          INSERT INTO user(username,name,password,gender,location)
          VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
    //const response = await db.run(createUser);
    if (password.length < 5) {
      res.send("Password is too short");
      res.status(400);
    } else {
      let response = await db.run(createUser);
      res.send("User created successfully");
      res.status(200);
    }
  } else {
    res.send("User already exists");
    res.status(400);
  }
});

//api for login

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = `
          SELECT * FROM user WHERE username='${username}';`;
  const response = await db.get(query);
  console.log(response);
  if (response === undefined) {
    res.send("Invalid user");
    res.status(400);
  } else {
    const bcryptPassword = await bcrypt.compare(password, response.password);
    if (bcryptPassword === true) {
      res.send("Login success!");
      res.status(200);
    } else {
      res.send("Invalid password");
      res.status(400);
    }
  }
});

//api call 3

app.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const query = `
        SELECT * FROM user
         WHERE username='${username}';`;
  const response = await db.get(query);
  const checkingPassword = await bcrypt.compare(oldPassword, response.password);
  if (checkingPassword === true) {
    if (newPassword.length < 5) {
      res.send("Password is too short");
      res.status(400);
    } else {
      const updatedPassword = bcrypt.hash(newPassword, 10);
      const query = `
         UPDATE user SET
            password='${updatedPassword}'
            WHERE username='${username}';`;
      const response = await db.run(query);
      //res.send("Password updated");
      res.send("Password updated");
      res.status(200);
    }
  } else {
    res.send("Invalid current password");
    res.status(400);
  }
});

module.exports = app;
