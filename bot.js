/*
botkitの準備
*/
let botkit = require('botkit');
let mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGODB_URI});

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

let controller = botkit.slackbot({
    storage: mongoStorage
}).configureSlackApp({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot', 'chat:write:user', 'chat:write:bot', 'files:write:user']
});

let bot = controller.spawn({
    token: process.env.token
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

controller.setupWebserver(process.env.PORT, function (err, webserver) {
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
メモ機能
*/
let webclient = require('request');
let fs = require("fs-extra");
let mkdirp = require("mkdirp");
let getDirName = require("path").dirname;

const MESSAGE = '現在保存しているメモ数: ';

//チャンネル名のパスを返す
function getPath(message) {
    return './todo/' + message.channel + '.txt';
}

//書き込む
function writeFile(path, contents, cb) {
    mkdirp(getDirName(path), function (err) {
        if (err)
            return cb(err);
        fs.writeFile(path, contents, cb);
    });
}

//追加する
function addFile(path, newtext) {
    fs.readFile(path, 'utf8', function (err, nowtext) {
        let matches = nowtext.match(/現在保存しているメモ数: (\d+)/);
        let num = matches[1] * 1 + 1;
        let newnum = `${MESSAGE}` + num;

        let tasks = nowtext.split(/\(\d+\)/);
        var write_data = "【" + newnum + "】\n";

        for (var i = 1; i < num; i++) {
            write_data = write_data + "(" + i + ") " + tasks[i];
        }
        write_data = write_data + "\n(" + i + ")" + newtext;


        fs.writeFile(path, write_data, function (err) {
            if (err) throw err;
        });
    });
}

function deleteMessage(channel, ts, time = 10000) {
    setTimeout(function () {
        bot.api.chat.delete({
            channel: channel,
            ts: ts,
            as_user: true
        }, function (err, res) {
            bot.botkit.log('chat.delete:\n', res);
        });
    }, time);
}

controller.hears(['add (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log(message.channel + ' : ' + message.ts);
    deleteMessage(message.channel, message.ts);

    let matches = message.text.match(/add (.*)/i);
    if (matches) {
        let text = matches[1];

        controller.storage.users.get(message.user, function (err, user) {
            let path = getPath(message);
            if (!fs.existsSync(path)) {
                writeFile(path, `${MESSAGE}0`, function (err) {
                    if (err) throw err;
                    addFile(path, text);
                });
            }
            else {
                addFile(path, text);
            }
            bot.reply(message, "メモを追加しました", function (err, res) {
                deleteMessage(res.channel, res.ts);
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
    deleteMessage(message.channel, message.ts, message.user);

    controller.storage.users.get(message.user, function (err, user) {
        let path = getPath(message);
        fs.readFile(path, 'utf8', function (err, text) {
            bot.reply(message, text, function (err, res) {
                deleteMessage(res.channel, res.ts, 60000);
            });
        });
    });
});


controller.hears(['remove (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    deleteMessage(message.channel, message.ts);

    var matches = message.text.match(/remove (\d+)/);
    if (matches) {
        let task = matches[1];

        controller.storage.users.get(message.user, function (err, user) {
            let path = getPath(message);
            fs.readFile(path, 'utf8', function (err, text) {
                matches = text.match(/現在保存しているメモ数: \d+/);
                num = matches[0].match(/\d+/) * 1;
                if (task <= num) {
                    bot.reply(message, "(" + task + ")" + "のメモを削除した", function (err, res) {
                        deleteMessage(res.channel, res.ts);
                    });

                    let newnum = `${MESSAGE}` + (num - 1);
                    let tasks = text.split(/\(\d+\)/);
                    tasks.splice(task, 1);
                    var write_data = "【" + newnum + "】\n";

                    for (var i = 1; i < num; i++) {
                        write_data = write_data + "(" + i + ") " + tasks[i];
                    }

                    fs.writeFile(path, write_data, function (err) {
                        if (err) throw err;
                    });
                }
                else {
                    bot.reply(message, "引数が間違ってます", function (err, res) {
                        deleteMessage(res.channel, res.ts);
                    });
                }

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
const timeline_id = 'C9EA1U46Q';
const timeline_name = 'times_timeline';


//ユーザ情報取得
let getUserInfo = function (user_id, callback) {
    webclient.get({
        url: 'https://slack.com/api/users.info',
        qs: {
            token: process.env.token,
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
            token: process.env.token,
            channel: channel_id
        }
    }, function (err, res, body) {
        if (err) throw err;

        callback('#' + JSON.parse(body).channel.name);
    });
}

//乗っ取り形式
function sendTaleover(user, text, permalink, channel_name) {
    var footer = permalink;
    if (!channel_name.match(/#(.*)/)){
        footer = '';
    }

    bot.api.chat.postMessage({
        channel: timeline_id,
        text: text,
        icon_url: user.image_1024,
        username: user.display_name + (` (${channel_name})`),
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
    let type = message.type.match('mention');
    if (type)
        return -1;

    //チャンネル名
    bot.api.channels.info({
        channel: message.channel
    }, function (err, res) {
        let channel_name = res.channel.name;
        let matches = channel_name.match(/times_(.*)/);

        //timelineなら何もしない
        if (channel_name === timeline_name || !matches)
            return -1;

        //メッセージのリンク取得
        webclient.get({
            url: 'https://slack.com/api/chat.getPermalink',
            qs: {
                token: process.env.token,
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
            token: process.env.legacy_token,
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