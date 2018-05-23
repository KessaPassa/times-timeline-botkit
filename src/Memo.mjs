import * as database from './Database';
import * as api from './SlackApi';
import * as Messages from './Messages';


export function add(bot, message) {
    api.deleteMessage(message.channel, message.ts);

    let matches = message.text.match(/add (.*)/i);
    if (matches) {
        let text = matches[1];

        api.getChannelName(message.channel, function (channel_name) {
            database.add(message.channel, channel_name, text, function (result) {
                bot.reply(message, Messages.add(), function (err, res) {
                    api.deleteMessage(res.channel, res.ts);
                });
            });
        });
    }
    else {
        bot.reply(message,Messages.wrong_arguments(), function (err, res) {
            api.deleteMessage(res.channel, res.ts);
        });
    }
}

export function list(bot, message) {
    api.deleteMessage(message.channel, message.ts, 3 * 60 * 1000);

    database.get(message.channel, function (text_array) {
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
            api.deleteMessage(res.channel, res.ts, 3 * 60 * 1000);
        });
    });
}


export function remove(bot, message) {
    api.deleteMessage(message.channel, message.ts);

    var matches = message.text.match(/remove (\d+)/);
    if (matches) {
        let num = matches[1];

        api.getChannelName(message.channel, function (channel_name) {
            database.remove(message.channel, channel_name, num, function (result) {
                var content = '';
                if (result == null)
                    content = Messages.cant_data();
                else if (result === -1)
                    content = Messages.cant_remove();
                else
                    content = Messages.removed(num);

                bot.reply(message, content, function (err, res) {
                    api.deleteMessage(res.channel, res.ts);
                });
            });
        });
    }
    else {
        bot.reply(message, Messages.wrong_arguments(), function (err, res) {
            api.deleteMessage(res.channel, res.ts);
        });
    }
}