require("dotenv").config();                 // config with environment variable
require("./config/database").connect();    // connecting with database
const express = require("express");    
const bcrypt = require("bcryptjs");     // used to hash the password
const jwt = require("jsonwebtoken");    // creating a json web token
const User = require("./model/user");   // user database model
const auth = require("./middleware/auth");

const app = express();

// middleware that parse the json into an request body
app.use(express.json());            

// Logic goes here 

// Register 
app.post("/register", async (req,res)=>{
    // Register logic goes here
    try {
        const { first_name, last_name, email, password } = req.body;
        
        // validate user input 
        if (!(email && password && first_name && last_name)){
            return res.status(400).send("All input is required");
        }

        // check if user already exit 
        const oldUser = await User.findOne({email});

        if (oldUser){
            return res.status(409).send("User Already Exist. Please Login");
        }

        // Encrypt user password 
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database 
        const user = await User.create({
            first_name, 
            last_name, 
            email: email.toLowerCase(), 
            password: encryptedPassword
        });

        // Create token 
        const token = jwt.sign(
            { user_id: user._id, email },   
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token; 

        // return new user 
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
})

// Login 
app.post("/login", async (req, res)=>{
    // Login logic goes here

    try {
        // Get user input
        const {email, password } = req.body; 
        console.log(email, password);

        // Validate user input 
        if (!(email && password)){
            return res.status(401).send("Input is required");
        }

        // Validate if user exist or not 
        const user = await User.findOne({email});

        if (user && (bcrypt.compare(password, user.password))) {
            // Create token 
            const token = jwt.sign(
                { user_id: user._id, email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h"
                }
            )
            // save user token 
            user.token = token;
             // user 
            res.status(200).json(user);
        }

        res.status(400).send("Invalid Credentials");
    } catch(err) {
        console.error(err);
    }
});

// Welcome route 
app.get("/welcome", auth, (req, res)=>{
    res.status(200).send("Welcome ");
})

module.exports = app;