const mongoose = require("mongoose");

const { MONGODB_URI } = process.env;

exports.connect = () => {
    mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{
        console.log("Successfully connected to database");
    })
    .catch((error)=>{
        console.log("database connection failed. existing now.....");
        console.error(error);
        process.exit(1);
    })
}