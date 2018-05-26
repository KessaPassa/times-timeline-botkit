// import * as env from '../secret/env';
let env = process.env;
import * as Messages from './Messages';
import firebase from 'firebase';

let database = null;

const DUMMY = 'Dummy';
const MEMO = 'channels';
const ROOM = 'room';


// データベース初期化
export function setup() {
    let config = {
        apiKey: env.apiKey,
        authDomain: env.authDomain,
        databaseURL: env.databaseURL,
        storageBucket: env.storageBucket
    };
    firebase.initializeApp(config);
    database = firebase.database();
}


// データベースから読み込み
export function getChannels(id, callback) {
    database.ref(`${MEMO}/${id}`).once('value').then(function (snapshot) {
        if (snapshot.val() != null) {
            callback(snapshot.val().text);
        }
        else {
            callback(null);
        }
    });
}


export function add(id, name, text, callback) {
    //データが存在してるか読み取り
    getChannels(id, function (text_array) {
        console.log(text_array);
        var result = '';

        //最初の時だけ
        if (!text_array) {
            database.ref(`${MEMO}/${id}`).set({
                name: name,
                text: {
                    0: Messages.list_header(),
                    1: text
                }
            });
            result = 'initialize';
        }
        //追加
        else {
            var json = {};
            var i = 0;
            for (; i < text_array.length; i++) {
                json[i] = text_array[i];
            }
            json[i] = text;

            //データベースにセット
            database.ref(`${MEMO}/${id}`).set({
                name: name,
                text: json
            });
            result = 'complete';
        }

        callback(result);
    });
}

export function remove(id, name, num, callback) {

    //データが存在してるか読み取り
    getChannels(id, function (text_array) {
        console.log(text_array);
        var result = '';

        //何もないと削除できない
        if (!text_array) {
            result = null;
        }
        //0と、ない数値は消せない
        else if (num === 0 || text_array.length <= num) {
            result = -1;
        }
        //追加
        else {
            text_array.splice(num, 1);
            console.log(text_array);

            var json = {};
            for (var i = 0; i < text_array.length; i++) {
                json[i] = text_array[i];
            }

            //データベースにセット
            database.ref(`${MEMO}/${id}`).set({
                name: name,
                text: json
            });
            result = 'complete';
        }

        callback(result);
    });
}


// データベースから読み込み
export function getRoom(callback) {
    database.ref(ROOM).once('value').then(function (snapshot) {
        if (snapshot.val() != null) {
            let ids = [];
            let names = [];

            snapshot.forEach(function (result) {
                if (result.key !== DUMMY) {
                    ids.push(result.key);
                    names.push(result.child('name').val());
                }
            });

            callback(ids, names);
        }
        else {
            callback(null);
        }
    });
}

export function login(id, name, callback) {


    getRoom(function (ids, names) {
        if (ids != null) {
            for (let i = 0; i < ids.length; i++) {
                // 既にログインしているなら
                if (ids[i] === id) {
                    callback(null);
                    return;
                }
            }
        }

        //データベースにセット
        database.ref(`${ROOM}/${id}`).set({
            name: name,
            text: 'login'
        });

        callback('new');
    });
}

export function logout(id, callback) {

    getRoom(function (ids, names) {
        if (ids != null) {
            for (let i = 0; i < ids.length; i++) {
                // ログインしているなら
                if (ids[i] === id) {
                    // nullをセットすることで削除する
                    database.ref(`${ROOM}/${id}`).set({
                        name: null,
                        text: null
                    });
                    callback('complete');
                    return;
                }
            }
        }

        callback(null);
    });
}

// 全員強制logout
export function forceLogout(callback) {
    getRoom(function (ids, names) {
        if (ids != null) {
            for (let i = 0; i < ids.length; i++) {
                // nullをセットすることで削除する
                database.ref(`${ROOM}/${ids[i]}`).set({
                    name: null,
                    text: null
                });
            }
            callback(names);
        }
        else{
            callback(null);
        }
    });
}