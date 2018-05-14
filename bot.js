/*
botkitの準備
*/

//ローカルと本番環境の切り替え
// let env = require('./secret/secret.json');
let env = process.env;
let mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGODB_URI});

let botkit = require('botkit');
if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
    console.log('Error: environment');
    process.exit(1);
}

let controller = botkit.slackbot({
    storage: mongoStorage
    // json_file_store_path: './secret'
}).configureSlackApp({
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
    scopes: ['bot', 'chat:write:user', 'chat:write:bot', 'files:write:user']
});

let bot = controller.spawn({
    token: env.token
}).startRTM();

bot.api.team.info({}, function (err, res) {
    if (err) {
        return console.error(err)
    }
    controller.storage.teams.save({id: res.team.id}, (err) => {
        if (err) {
            console.error(err)
        }
    });
});

controller.setupWebserver(env.PORT || 8000, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


/*
データベース初期化
*/
let firebase = require("firebase");
let config = {
    apiKey: env.apiKey,
    authDomain: env.authDomain,
    databaseURL: env.databaseURL,
    storageBucket: env.storageBucket
};
firebase.initializeApp(config);
let database = firebase.database();

// データベースに追加
let addDB = function (id, name, text, callback) {

    //データが存在してるか読み取り
    getDB(id, function (text_array) {
        console.log(text_array);
        var result = '';

        //最初の時だけ
        if (!text_array) {
            database.ref(`channels/${id}`).set({
                name: name,
                text: {
                    0: MESSAGE,
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
};

// データベースから削除
let removeDB = function (id, name, num, callback) {

    //データが存在してるか読み取り
    getDB(id, function (text_array) {
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
};

// データベースから読み込み
let getDB = function (id, callback) {
    database.ref(`channels/${id}`).once('value').then(function (snapshot) {
        if (snapshot.val() != null) {
            callback(snapshot.val().text);
        }
        else {
            callback(null);
        }
    });
};


/*
メモ機能
*/
let webclient = require('request');
const MESSAGE = '【現在保存しているメモ】';

function deleteMessage(channel, ts, time = 30 * 1000) {
    setTimeout(function () {
        bot.api.chat.delete({
            token: env.legacy_token,
            channel: channel,
            ts: ts,
            as_user: true
        }, function (err, res) {
            bot.botkit.log('chat.delete:\n', res);
        });
    }, time);
}

controller.hears(['add (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    deleteMessage(message.channel, message.ts);

    let matches = message.text.match(/add (.*)/i);
    if (matches) {
        let text = matches[1];

        getChannelName(message.channel, function (channel_name) {
            addDB(message.channel, channel_name, text, function (result) {
                bot.reply(message, "メモを追加しました", function (err, res) {
                    deleteMessage(res.channel, res.ts);
                });
            });
        });
    }
    else {
        bot.reply(message, "引数が間違ってます", function (err, res) {
            deleteMessage(res.channel, res.ts);
        });
    }
});

controller.hears(['list'], 'direct_message,direct_mention,mention', function (bot, message) {
    deleteMessage(message.channel, message.ts, 3 * 60 * 1000);

    getDB(message.channel, function (text_array) {
        //エラー
        if (text_array == null) {
            console.log('list error');
        }

        var text = '';
        for (var i = 0; i < text_array.length; i++) {
            if (i === 0)
                text += `${text_array[i]}\n`;
            else
                text += `${i}. ${text_array[i]}\n`;
        }
        bot.reply(message, text, function (err, res) {
            deleteMessage(res.channel, res.ts, 3 * 60 * 1000);
        });
    });
});


controller.hears(['remove (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    deleteMessage(message.channel, message.ts);

    var matches = message.text.match(/remove (\d+)/);
    if (matches) {
        let num = matches[1];

        getChannelName(message.channel, function (channel_name) {
            removeDB(message.channel, channel_name, num, function (result) {
                var content = '';
                if (result == null)
                    content = "データがありません";
                else if (result === -1)
                    content = "削除できない番号です";
                else
                    content = `${num}番のメモを削除した`;

                bot.reply(message, content, function (err, res) {
                    deleteMessage(res.channel, res.ts);
                });
            });
        });
    }
    else {
        bot.reply(message, "引数が間違ってます", function (err, res) {
            deleteMessage(res.channel, res.ts);
        });
    }
});


/*
timeline処理
*/
const timeline_id = env.timeline_id;
const timeline_name = 'times_timeline';


//ユーザ情報取得
let getUserInfo = function (user_id, callback) {
    webclient.get({
        url: 'https://slack.com/api/users.info',
        qs: {
            token: env.token,
            user: user_id
        }
    }, function (err, res, body) {
        if (err) throw err;

        callback(JSON.parse(body).user.profile);
    });
};

//チャンネルの名前取得
let getChannelName = function (channel_id, callback) {
    webclient.get({
        url: 'https://slack.com/api/channels.info',
        qs: {
            token: env.token,
            channel: channel_id
        }
    }, function (err, res, body) {
        if (err) throw err;

        callback('#' + JSON.parse(body).channel.name);
    });
};

//乗っ取り形式
function sendTaleover(user, text, permalink, channel_name) {
    var footer = permalink;
    if (!channel_name.match(/#(.*)/)) {
        footer = '';
    }

    bot.api.chat.postMessage({
        channel: timeline_id,
        text: text,
        icon_url: user.image_1024,
        username: (user.display_name || user.real_name) + (` (${channel_name})`),
        link_names: true,
        attachments: [{
            text: '',
            footer: footer
            // title: `Posted in #${channel_name}`,
            // title_link: permalink
        }]
    }, function (err, res) {
        if (err) throw err;
    });
}

//引用リンク形式
function sendQuotelink(user, text, permalink) {
    bot.api.chat.postMessage({
        channel: timeline_id,
        text: permalink,
        link_names: true,
        attachments: [{
            author_name: user.display_name,
            author_icon: user.image_1024,
            text: text,
        }]
    }, function (err, res) {
        if (err) throw err;
    });
}

controller.hears(['(.*)'], 'ambient', function (bot, message) {

    console.log(message);
    // let type = message.type.match('mention');
    // if (type)
    //     return -1;

    //チャンネル名
    bot.api.channels.info({
        channel: message.channel
    }, function (err, res) {
        let channel_name = res.channel.name;
        let matches = channel_name.match(/times_(.*)/);

        //timelineならread-onlyなので警告する
        if (channel_name === timeline_name || !matches) {
            bot.reply(message, 'ここで喋っちゃダメなんだよ〜');
            return -1;
        }

        //メッセージのリンク取得
        webclient.get({
            url: 'https://slack.com/api/chat.getPermalink',
            qs: {
                token: env.token,
                channel: message.channel,
                message_ts: message.ts
            }
        }, function (err, res, body) {
            if (err) throw err;

            let permalink = JSON.parse(body).permalink;
            getUserInfo(message.user, function (user) {
                getChannelName(message.channel, function (channel_name) {
                    sendTaleover(user, message.text, permalink, channel_name);
                    // sendQuotelink(user, message.text, permalink);
                });
            });
        });
    });

});

controller.on(['file_shared'], function (bot, message) {

    console.log(message);
    webclient.get({
        url: "https://slack.com/api/files.sharedPublicURL",
        qs: {
            token: env.legacy_token,
            file: message.file_id
        }
    }, function (err, res, body) {
        //既にpublic_urlを取得しているとエラーが起きるので
        if (err) throw err;

        let permalink = JSON.parse(body).file.permalink;
        getUserInfo(message.user_id, function (user) {
            sendTaleover(user, permalink, permalink, 'file');
        });

    });
});