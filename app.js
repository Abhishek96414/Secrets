//jshint esversion:6
// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
// require and config of dotenv package is required early in the application
// no need of using a constant variable here
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// used for encrypting mongoose database data
const encrypt = require("mongoose-encryption");
const app = express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});
// construct a database for storing user info
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
// provide access to environment variable API_KEY
console.log(process.env.API_KEY);
// use a plugin to encrypt the user password using secret key
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.post("/register",function(req,res){
  // create a new user in database
  const newUser = new User({
    // extract the email and password fields
    email: req.body.username,
    password: req.body.password
  });
  // save the newly created user in database while checking for errors
  newUser.save(function(err){
    if(err)
      console.log(err);
    else
    // load up secrets page
      res.render("secrets");
  });
});
app.post("/login",function(req,res){
  // extract the email and password fields
  const username = req.body.username;
  const password = req.body.password;
  // use findOne function to find a user with an email field equal to email field in database
  User.findOne({email: username}, function(err,foundUser){
    if(err)
      console.log(err);
    else{
      //if a user is found with specified criteria
      if(foundUser){
        // check if password entered in password field matches the password of the user saved in database
        if(foundUser.password === password)
          // load the secrets page
          res.render("secrets");
        else
        // load the error message
          res.send("Invalid Credentials!");
      }
    }
  });
});


app.listen(3000,function(req,res){
  console.log("Server started successfully on port 3000");
});
