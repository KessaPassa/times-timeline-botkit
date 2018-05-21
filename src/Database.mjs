import * as env from '../secret/env';
import * as Messages from './Messages';
import firebase from 'firebase';
let database = null;


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

export function add(id, name, text, callback){
    //データが存在してるか読み取り
    get(id, function (text_array) {
        console.log(text_array);
        var result = '';

        //最初の時だけ
        if (!text_array) {
            database.ref(`channels/${id}`).set({
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
            database.ref(`channels/${id}`).set({
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
    get(id, function (text_array) {
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
            database.ref(`channels/${id}`).set({
                name: name,
                text: json
            });
            result = 'complete';
        }

        callback(result);
    });
}

// データベースから読み込み
export function get(id, callback) {
    database.ref(`channels/${id}`).once('value').then(function (snapshot) {
        if (snapshot.val() != null) {
            callback(snapshot.val().text);
        }
        else {
            callback(null);
        }
    });
}