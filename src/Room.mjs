import * as env from '../secret/env';
// let env = process.env;
import * as database from './Database';
import * as api from './SlackApi';
import * as Messages from './Messages';


export function login(bot, message) {
    api.getChannelName(message.channel, function (channelName) {
        if (channelName !== env.room_name)
            return -1;

        let id = message.user;
        api.getUserInfo(id, function (user) {
            let name = user.display_name || user.real_name;
            database.login(id, name, function (result) {
                if (result == null) {
                    bot.reply(message, `<@${id}> ${Messages.allreadyLogin()}`);
                }
                else {
                    bot.reply(message, `<@${id}> ${Messages.login()}`);
                }
            });
        });
    });
}

export function logout(bot, message) {
    api.getChannelName(message.channel, function (channelName) {
        if (channelName !== env.room_name)
            return -1;

        let id = message.user;
        database.logout(id, function (result) {
            if (result == null) {
                bot.reply(message, `<@${id}> ${Messages.alreadyLogout()}`);
            }
            else {
                bot.reply(message, `<@${id}> ${Messages.logout()}`);
            }
        });
    });
}

export function room(bot, message) {
    api.getChannelName(message.channel, function (channelName) {
        if (channelName !== env.room_name)
            return -1;

        database.getRoom(function (ids, names) {
            let num = ids.length;
            let list = `【現在の在室メンバー${num}人】\n`;
            if (num === 0) {
                list += '誰もいないよ';
            }
            else {
                for (let i = 0; i < num; i++) {
                    list += `${names[i]}\n`;
                }
            }
            bot.reply(message, list);
        });
    });
}

export function forceLogout(){
    console.log('強制ログアウト');
    database.forceLogout(function (names) {
        if (names != null) {
            let list = '5時になったから強制退去したよ\n';
            for (let i=0; i<names.length; i++){
                list += `${names[i]}\n`;
            }
            api.postMessage(env.room_id, list);
        }
    });
}