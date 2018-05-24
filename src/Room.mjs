import * as database from './Database';
import * as api from './SlackApi';
import * as Messages from './Messages';


export function login(bot, message) {
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
}

export function logout(bot, message) {
    let id = message.user;
    database.logout(id, function (result) {
        if (result == null) {
            bot.reply(message, `<@${id}> ${Messages.alreadyLogout()}`);
        }
        else {
            bot.reply(message, `<@${id}> ${Messages.logout()}`);
        }
    });
}

export function room(bot, message) {
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
}