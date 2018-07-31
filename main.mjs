// import * as env from "./secret/env";
let env = process.env;
// import * as bot from './src/SetupBotkit';
// let controller = bot.setup();
//
// データベース
import * as database from './src/Database';

database.setup();
//
//
// // メモ機能
// import * as memo from './src/Memo';
// controller.hears(['add (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
//     memo.add(bot, message);
// });
//
// controller.hears(['list'], 'direct_message,direct_mention,mention', function (bot, message) {
//     memo.list(bot, message);
// });
//
// controller.hears(['remove (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
//     memo.remove(bot, message);
// });
//
//
// // 在室管理
// import * as room from './src/Room';
// controller.hears(['login'], 'direct_mention,mention', function (bot, message) {
//     room.login(bot, message);
// });
//
// controller.hears(['logout'], 'direct_mention,mention', function (bot, message) {
//     room.logout(bot, message);
// });
//
// controller.hears(['room'], 'direct_mention,mention', function (bot, message) {
//     room.room(bot, message);
// });
//
// import schedule from 'node-schedule';
// schedule.scheduleJob({
//     hour: 5,
//     minute: 0
// }, function () {
//     room.forceLogout();
// });
//
//
// // 分報機能
// import * as timeline from './src/Timeline';
// controller.hears(['(.*)'], 'ambient', function (bot, message) {
//     timeline.chat(bot, message);
// });
//
// controller.on(['file_shared'], function (bot, message) {
//     timeline.file(bot, message);
// });


// APIサーバ機能
import express from "express";
import bodyParser from 'body-parser';
// import mongodb from 'mongodb';
import * as serverApi from "./src/ReceiveServer";

const app = express();
app.set('port', env.PORT || 8010);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// app.use("/", (function () {
//     let router = express.Router();

// 在室情報
app.post('https://times-timeline-botkit-stg.herokuapp.com/room/info', (request, response) => {
    serverApi.getInfo(request, response);
});

// login, logout管理
app.post('https://times-timeline-botkit-stg.herokuapp.com/room/management', (request, response) => {
    serverApi.sendInfo(request, response);
});

app.post('https://times-timeline-botkit-stg.herokuapp.com/room', (request, response) => {
    response.json({
        status: 'okokok'
    });
});

app.post('/hoge', (request, response) => {
    response.json({
        status: 'hogehoge'
    });
});

//     return router;
// })());
// app.listen(8010);

// let db;
//
// // Connect to the database before starting the application server.
// mongodb.MongoClient.connect(env.MONGODB_URI || "mongodb://localhost:27017/test", function (err, client) {
//     if (err) {
//         console.log(err);
//         process.exit(1);
//     }
//
//     // Save database object from the callback for reuse.
//     db = client.db();
//     console.log("Database connection ready");
//
//     // Initialize the app.
//     let server = app.listen(8010, function () {
//         let port = server.address().port;
//         console.log("App now running on port", port);
//     });
// });
//
// import * as serverApi from "./src/ReceiveServer";
// // 在室情報
// app.post("/room/info", function(request, response) {
//     serverApi.getInfo(request, response);
// });
//
// // login, logout管理
// app.post("/room/management", function(request, response) {
//     serverApi.sendInfo(request, response);
// });
//
// app.get("/room", function(request, response) {
//     response.json({
//         status: 'okokok'
//     });
// });