const express = require("express");
const router = express.Router();
const { Expo } = require("expo-server-sdk");
const sendPushNotification = require("../utilities/pushNotifications");
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
    res.send({status: 'success'});
});

var alert_types = {};
var alert_messages = {
    "roz_down": "Alert\nRoznama is donwn",
    "92_down": "Alert\n92 news down",
    "test":"Fine\nJust Testing alert types"
};

(function(){
    for(let item in alert_messages){
        alert_types[item] = {
            id: item,
            active: 0,
            message: alert_messages[item].message,
            subscribers: [],
            excluded: [],
        };
    }
})();

function generate_error(res, message){
    let resp = {status: 'error', message: message};
    res.send(resp);
}

var pushTokens = [];
router.get("/submit-token",  async (req, res) => {
    let obtained_token = req.query.obtained_token;
    if(!obtained_token){
        let resp = {status: 'error', 'message': 'No token given'};
        res.send(resp);
        return;
    }
    if (!Expo.isExpoPushToken(obtained_token)){
        let resp = {status: 'error', 'message': 'Invalid token'};
        res.send(resp);
        return;
    }
    let active_alert_types = [];
    console.log('Token count now => '+pushTokens.length);
    if(pushTokens.indexOf(obtained_token) == -1){
        pushTokens.push(obtained_token);
    }
    for(const [key, item] of Object.entries(alert_types)){
        if(!item.active){
            continue;
        }
        if(item.excluded.indexOf[obtained_token] != -1){
            if(item.subscribers.indexOf(obtained_token) == -1)
            {
                item.subscribers.push(obtained_token);
            }
            active_alert_types.push(key);
        }
    }
    console.log('Token count now => ' + pushTokens.length);
    let resp = {status: 'success', active_alert_types: active_alert_types};
    res.send(resp);
});


router.get("/activate",  async (req, res) => {
    let note_id = req.query.note_id;
    let error_message = '';
    if(!alert_types.hasOwnProperty(note_id)){
        error_message = 'Invalid alert id => ' + note_id;
        generate_error(error_message);
        return;
    }

    let audience = generate_alterts(note_id, res);
    let resp = {status: 'success', audience: audience.length};
    res.send(resp);
});

function generate_alterts(note_id){
    let ind = 0;
    let audience = [];
    let error_message = '';
    if(!alert_types.hasOwnProperty(note_id)){
        error_message = 'Invalid alert id => ' + note_id;
        generate_error(error_message);
        return;
    }
    if(alert_types[note_id].active){
        return alert_types[note_id].subscribers;
    }
    let removeValFromIndex = [];
    for(let expoPushToken of pushTokens){
        if (Expo.isExpoPushToken(expoPushToken)) {
            audience.push(expoPushToken);
        }
        else{
            removeValFromIndex.push(ind);
        }
        ind += 1;
    }
    for (var i = removeValFromIndex.length -1; i >= 0; i--)
    {
        pushTokens.splice(removeValFromIndex[i], 1);
    }
    alert_types[note_id].active = 1;
    alert_types[note_id].subscribers.excluded = [];
    alert_types[note_id].subscribers = audience;
    return audience;
}

router.get("/stop",  async (req, res) => {
    let note_id = req.query.note_id;
    let device_token = req.query.device_token;
    if(!alert_types.hasOwnProperty(note_id)){
        let resp = {status: 'error', message: 'Invalid alert id => '+note_id};
        res.send(resp);
        return;
    }
    let message = '';
    let audience = alert_types[note_id].subscribers;
    let active_device_index = audience.indexOf(device_token);
    if(active_device_index != -1){
        audience.splice(active_device_index, 1);
        if(alert_types[note_id].excluded.indexOf(device_token) == -1)
        {
            alert_types[note_id].excluded.push(device_token);
        }
        if(!alert_types[note_id].subscribers.length){
            alert_types[note_id].active = 0;
            message = note_id + ' is deactivated now';
        }
    }
    let resp = {status: 'success', message: message};
    res.send(resp);
});

router.get("/check",  async (req, res) => {
    let device_token = req.query.device_token;
    let token_at_server = pushTokens.find(x=>x == device_token);
    let message = 'already there';
    if(!token_at_server){
        if (!Expo.isExpoPushToken(device_token)){
            let resp = {status: 'error', 'message': 'Invalid token'};
            res.send(resp);
            return;
        }
        pushTokens.push(device_token);
        message = 'Submitted now';
    }
    let resp = {status: "success", message: message};
    res.send(resp);
});

router.get("/send",  async (req, res) => {
    let note_id = req.query.note_id;
    let error_message = '';
    if(!alert_types.hasOwnProperty(note_id)){
        error_message = 'Invalid alert id => ' + note_id;
        generate_error(error_message);
        return;
    }
    if(!alert_types[note_id].active){
        error_message = 'Inactive alert id => ' + note_id;
        generate_error(error_message);
        return;
    }
    const message = alert_messages[note_id];
    let audience = alert_types[note_id].subscribers;
    let sent_count = 0;
    for(let expoPushToken of audience){
        if (Expo.isExpoPushToken(expoPushToken)) {
            sent_count += 1;
            sendPushNotification(expoPushToken, note_id, message);
        }
    }
    let resp = {status: 'success', sent: sent_count};
    console.log(resp);
    res.send(resp);
});


generate_alterts('test');

module.exports = router;
