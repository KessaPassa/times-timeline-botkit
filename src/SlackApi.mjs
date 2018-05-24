import * as env from '../secret/env';
// let env = process.env;
import request from 'request';


// メッセージ削除
export function deleteMessage(channel, ts, time = 30 * 1000) {
    setTimeout(function () {
        request.post({
            url: 'https://slack.com/api/chat.delete',
            form: {
                token: env.legacy_token,
                channel: channel,
                ts: ts,
                as_user: true
            }
        }, function (err, res, body) {
            console.log('chat.delete');
        });
    }, time);
}

//ユーザ情報取得
export function getUserInfo(user_id, callback) {
    request.get({
        url: 'https://slack.com/api/users.info',
        qs: {
            token: env.token,
            user: user_id
        }
    }, function (err, res, body) {
        if (err) throw err;

        callback(JSON.parse(body).user.profile);
    });
}

//チャンネルの名前取得
export function getChannelName(channel_id, callback) {
    request.get({
        url: 'https://slack.com/api/channels.info',
        qs: {
            token: env.token,
            channel: channel_id
        }
    }, function (err, res, body) {
        if (err) throw err;

        callback('#' + JSON.parse(body).channel.name);
    });
}

//乗っ取り形式
export function sendTaleover(user, text, permalink, channel_name) {
    var footer = permalink;
    if (!channel_name.match(/#(.*)/)) {
        footer = '';
    }

    request.post({
        url: 'https://slack.com/api/chat.postMessage',
        form: {
            token: env.token,
            channel: env.timeline_id,
            text: text,
            icon_url: user.image_1024,
            username: (user.display_name || user.real_name) + (` (${channel_name})`),
            link_names: true,
            attachments: JSON.stringify([{
                text: '',
                footer: footer
            }])
        }
    }, function (err, res, body) {
        if (err) throw err;
        console.log(body);
    });
}

//引用リンク形式
export function sendQuotelink(user, text, permalink) {
    request.post({
        url: 'https://slack.com/api/chat.postMessage',
        form: {
            token: env.token,
            channel: env.timeline_id,
            text: permalink,
            link_names: true,
            attachments: JSON.stringify([{
                author_name: user.display_name,
                author_icon: user.image_1024,
                text: text
            }])
        }, function (err, res, body) {
            if (err) throw err;
            console.log(body);
        }
    });
}