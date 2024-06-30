const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let items = [];

app.get("/", function (req, res) {
    res.render("list", { items: items });
});

app.post("/", function (req, res) {
    let item = req.body.todo;
    if (item) {
        items.push(item);
    }
    res.redirect("/");
});

app.listen(3000, function () {
    console.log("Server is listening on port 3000");
});
