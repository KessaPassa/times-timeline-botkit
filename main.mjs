// const bot = require('./src/SetupBotkit');
import * as bot from './src/SetupBotkit';
// bot.setup();
// let controller = bot.controller();
let controller = bot.setup();

// const database = require('./src/Database');
import * as database from './src/Database';
database.setup();


// メモ機能
// const memo = require('./src/Memo.mjs');
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


// 分報機能
// const timeline = require('./src/Timeline.mjs');
import * as timeline from './src/Timeline'
import {env} from "./secret/env";
controller.hears(['(.*)'], 'ambient', function (bot, message) {
    timeline.chat(bot, message);
});

controller.on(['file_shared'], function (bot, message) {
    timeline.file(bot, message);
});