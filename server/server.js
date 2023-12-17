const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8088;
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use("/", (req, res) => {
    res.send("SERVER ONNNNN");
})

app.listen(port, () => {
    console.log("Server running on the port: " + port);
})
