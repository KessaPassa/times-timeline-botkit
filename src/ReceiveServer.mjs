// データベース
import * as database from './Database';

// api受け取りサーバ
import * as settings from './UsersSettings';
settings.setup();


export function getInfo(request, response){
    database.getRoom(function (ids, names) {
        // 在室してる人
        let inRoomUsers = [];
        for (let i = 0; i < ids.length; i++) {
            inRoomUsers.push(settings.getUserById(ids[i]).Name);
        }

        // 帰宅してる人
        let goBackUsers = settings.getOnlyNames();
        for (let i = 0; i < inRoomUsers.length; i++) {
            // inRoomにないなら
            let index = goBackUsers.indexOf(inRoomUsers[i]);
            console.log(index);
            if (index !== -1) {
                goBackUsers.splice(index, 1);
            }
        }

        let json = {
            in: inRoomUsers,
            out: goBackUsers
        };
        response.json(json);
    });
}

export function sendInfo(request, response){
    let body = request.body;
    let name = body.name;

    let user = settings.getUserByName(name);
    // console.log(user);

    if (user !== undefined) {
        let status = '';
        if (body.status === 0) {
            status = '在室';
            database.login(user.Id, user.Name, function (result) {
            });
        }
        else if (body.status === 1) {
            status = '帰宅';
            database.logout(user.Id, user.Name, function (result) {
            });
        }
        else if (body.status === 2) {
            status = '一時退勤';
            database.logout(user.Id, user.Name, function (result) {
            });
        }

        let json = {
            name: name,
            status: status
        };
        response.json(json);
    }
}

// import * as database from './Database';
// database.setup();
//
// import * as settings from './UsersSettings'
// settings.setup();
//
// console.log('ReceiveServer');
//
// import express from "express";
// import bodyParser from 'body-parser'
//
// const app = express();
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
//
// app.use("/", (function () {
//     let router = express.Router();
//
//     // 在室情報
//     router.post("/room/info", (request, response) => {
//         database.getRoom(function (ids, names) {
//             let inRoomUsers = [];
//             for (let i = 0; i < ids.length; i++) {
//                 inRoomUsers.push(settings.getUserById(ids[i]).Name);
//             }
//
//             const users = settings.getOnlyNames();
//             let goBackUsers = settings.getOnlyNames();
//             for (let i = users.length - 1; i >= 0; i--) {
//                 // inRoomにないなら
//                 let index = inRoomUsers.indexOf(users[i].Id);
//                 if (index === -1) {
//                     goBackUsers.slice(index, 1);
//                 }
//             }
//
//             let json = {
//                 in: inRoomUsers,
//                 out: goBackUsers
//             };
//             response.json(json);
//         })
//     });
//
//     // login, logout管理
//     router.post("/room/management", (request, response) => {
//         let body = request.body;
//         let name = body.name;
//
//         let user = settings.getUserByName(name);
//         // console.log(user);
//
//         if (user !== undefined) {
//             let status = '';
//             if (body.status === 0) {
//                 status = '在室';
//                 database.login(user.Id, user.Name, function (result) {
//                 });
//             }
//             else if (body.status === 1) {
//                 status = '帰宅';
//                 database.logout(user.Id, user.Name, function (result) {
//                 });
//             }
//             else if (body.status === 2) {
//                 status = '一時退勤';
//                 database.logout(user.Id, user.Name, function (result) {
//                 });
//             }
//
//             let json = {
//                 name: name,
//                 status: status
//             };
//             response.json(json);
//             // console.log(`name: ${body.name}, status: ${status}`);
//         }
//     });
//
//     return router;
// })());
// app.listen(8010);
//
//
