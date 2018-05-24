import * as bot from './src/SetupBotkit';
let controller = bot.setup();

import * as database from './src/Database';
database.setup();


// メモ機能
import * as memo from './src/Memo';
controller.hears(['add (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    memo.add(bot, message);
});

controller.hears(['list'], 'direct_message,direct_mention,mention', function (bot, message) {
    memo.list(bot, message);
});

controller.hears(['remove (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    memo.remove(bot, message);
});


// 在室管理
import * as room from './src/Room';
controller.hears(['login'], 'direct_message,direct_mention,mention', function (bot, message) {
    room.login(bot, message);
});

controller.hears(['logout'], 'direct_message,direct_mention,mention', function (bot, message) {
    room.logout(bot, message);
});

controller.hears(['room'], 'direct_message,direct_mention,mention', function (bot, message) {
    room.room(bot, message);
});


// 分報機能
import * as timeline from './src/Timeline'
controller.hears(['(.*)'], 'ambient', function (bot, message) {
    timeline.chat(bot, message);
});

controller.on(['file_shared'], function (bot, message) {
    timeline.file(bot, message);
});