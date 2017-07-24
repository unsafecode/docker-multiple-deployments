const express = require("express");

const app = express();
const VERSION = "1.0.0";

app.use("/", (req, res) => {
    res.json({
        message: "Hello!",
        channel: process.env.CHANNEL,
        VERSION
    });
});

app.listen(3000, () => {
    console.log("App started!");
});