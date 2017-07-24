const express = require("express");

const app = express();
const VERSION = "1.0.1";

app.use("/", (req, res) => {
    res.json({
        message: "Hello!",
        VERSION
    });
});

app.listen(3000, () => {
    console.log("App started!");
});