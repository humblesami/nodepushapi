const config = {
    "delay": 1000,
    "maxImageCount": 3,
    "port": 3274,
    "delay": 1000,
    get: function (prop) {
        return this[prop];
    }
};

var express = require('express'),
httpApp = require('http'),
https = require('https'), fs = require('fs'), app = express();

var httpsOptions = undefined;
(function(){
    let key_file = '';
    let cert_file = '';
    try{
        key_file = fs.readFileSync("/etc/letsencrypt/live/dap.92newshd.tv/privkey.pem");
        cert_file = fs.readFileSync("/etc/letsencrypt/live/dap.92newshd.tv/fullchain.pem");
        if(key_file && cert_file){
            httpsOptions = {
                key: key_file,
                cert: cert_file
            };
        }
        else{
            console.log('Not key or cert');
        }
    }
    catch(er){
        console.log('Error in read => ', er);
    }
})();

const my = require("./routes/my");
const auth = require("./routes/auth");
const user = require("./routes/user");
const users = require("./routes/users");
const listing = require("./routes/listing");
const listings = require("./routes/listings");
const messages = require("./routes/messages");
const categories = require("./routes/categories");
const expoPushTokens = require("./routes/expoPushTokens");

app.use("/api/my", my);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/listing", listing);
app.use("/api/listings", listings);
app.use("/api/messages", messages);
app.use("/api/categories", categories);
app.use("/api/expoPushTokens", expoPushTokens);

const helmet = require("helmet");
const compression = require("compression");
app.use(helmet());
app.use(compression());
app.enable('trust proxy');
app.use(express.json());


var router = express.Router();
router.get('/', function (req, res, next) {
    res.send({ status: 'success', message: "Default App" });
});
router.get('/other', function (req, res, next) {
    res.send({ status: 'success', message: "Other App" });
});
app.use(router);
app.use(express.static("public"));


let server_obj = undefined;
if(httpsOptions)
{
    server_obj = https.createServer(httpsOptions, app);
}
else{
    server_obj = httpApp.createServer(app);
}

let run_point = config.get('port');
server_obj.listen(run_point, function() {
    let http_type = 'http';
    if (httpsOptions){
        http_type += 's';
    }
    console.log('Express '+http_type+' server listening on ' + run_point);
});
