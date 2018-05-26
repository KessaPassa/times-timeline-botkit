// import * as env from '../secret/env';
let env = process.env;
import * as api from './SlackApi';
import * as Messages from './Messages';
import request from 'request';


export function chat(bot, message) {
    console.log(message);

    //チャンネル名
    bot.api.channels.info({
        channel: message.channel
    }, function (err, res) {
        let channel_name = res.channel.name;

        //timelineならread-onlyなので警告する
        console.log('channelNama: ' + channel_name);
        if (channel_name === env.timeline_name) {
            bot.reply(message, Messages.cant_chat());
            return -1;
        }

        //メッセージのリンク取得
        request.get({
            url: 'https://slack.com/api/chat.getPermalink',
            qs: {
                token: env.token,
                channel: message.channel,
                message_ts: message.ts
            }
        }, function (err, res, body) {
            if (err) throw err;

            let permalink = JSON.parse(body).permalink;
            api.getUserInfo(message.user, function (user) {
                api.getChannelName(message.channel, function (channel_name) {
                    api.sendTaleover(user, message.text, permalink, channel_name);
                    // api.sendQuotelink(user, message.text, permalink);
                });
            });
        });
    });

}

export function file(bot, message) {
    console.log(message);

    request.get({
        url: "https://slack.com/api/files.sharedPublicURL",
        qs: {
            token: env.legacy_token,
            file: message.file_id
        }
    }, function (err, res, body) {
        //既にpublic_urlを取得しているとエラーが起きるので
        if (err) throw err;

        let permalink = JSON.parse(body).file.permalink;
        api.getUserInfo(message.user_id, function (user) {
            api.sendTaleover(user, permalink, permalink, 'file');
        });

    });
}