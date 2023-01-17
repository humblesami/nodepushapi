const express = require("express");
const router = express.Router();
const { Expo } = require("expo-server-sdk");
const sendPushNotification = require("../utilities/pushNotifications");
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
    res.send({status: 'success'});
});


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
    console.log('Token count now => '+pushTokens.length);
    if(pushTokens.indexOf(obtained_token) == -1){
        pushTokens.push(obtained_token);
    }
    console.log('Token count now => '+pushTokens.length);
    let resp = {status: 'success'};
    res.send(resp);
});

var notes = {"roz_down": [], "92_down": [], "test":[]};
var down_alerts = {"roz_down": "Alert\nRoznama is donwn", "92_down": "Alert\n92 news down", "test":"Fine\nJust Testing notes"}
router.get("/generate",  async (req, res) => {
    let note_id = req.query.note_id;
    if(!notes.hasOwnProperty(note_id)){
        let resp = {status: 'error', message: 'Invalid alert id => '+note_id};
        res.send(resp);
        return;
    }
    let ind = 0;
    let audience = [];
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
    notes[note_id] = audience;
    let resp = {status: 'success', audience: audience.length};
    res.send(resp);
});


router.get("/stop",  async (req, res) => {
    let note_id = req.query.note_id;
    let device_token = req.query.device_token;
    if(!notes.hasOwnProperty(note_id)){
        let resp = {status: 'error', message: 'Invalid alert id => '+note_id};
        res.send(resp);
        return;
    }
    let audience = notes[note_id];
    let active_device_index = audience.indexOf(device_token);
    if(active_device_index != -1){
        notes[note_id].splice(active_device_index, 1);
        console.log('Token count1 now => '+pushTokens.length);
    }
    let resp = {status: 'success'};
    res.send(resp);
});

router.get("/check-token",  async (req, res) => {
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
    if(!notes.hasOwnProperty(note_id)){
        let resp = {status: 'error', message: 'Invalid alert id => '+note_id};
        res.send(resp);
        return;
    }
    const message = down_alerts[note_id];
    let audience = notes[note_id];
    if(note_id == "test"){
        audience = pushTokens;
    }
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

module.exports = router;
