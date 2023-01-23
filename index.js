const config = {
    "delay": 1000,
    "maxImageCount": 3,
    "port": 3274,
    "delay": 1000,
    get: function (prop) {
        return this[prop];
    }
};

var express = require('express');
var app = express();
var router = express.Router();
const port = process.env.PORT || config.get("port");

const my = require("./routes/my");
const auth = require("./routes/auth");
const user = require("./routes/user");
const users = require("./routes/users");
const listing = require("./routes/listing");
const listings = require("./routes/listings");
const messages = require("./routes/messages");
const categories = require("./routes/categories");
const expoPushTokens = require("./routes/expoPushTokens");

const helmet = require("helmet");
const compression = require("compression");

app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use("/api/my", my);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/listing", listing);
app.use("/api/listings", listings);
app.use("/api/messages", messages);
app.use("/api/categories", categories);
app.use("/api/expoPushTokens", expoPushTokens);


app.get('/', function (req, res, next) {
    res.send({ status: 'success', message: "Default App" });
});
app.get('/other', function (req, res, next) {
    res.send({ status: 'success', message: "Other Route" });
});
app.use(router);


app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});
