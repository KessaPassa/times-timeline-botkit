var env = null;
var controller = null;
var bot = null;

exports.setup = function () {
    /*
botkitの準備
*/

    //ローカルと本番環境の切り替え
    env = require('../secret/secret.json');
    // env = process.env;
    // let mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGODB_URI});

    let botkit = require('botkit');
    if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
        console.log('Error: environment');
        process.exit(1);
    }

    controller = botkit.slackbot({
        // storage: mongoStorage
        json_file_store_path: './secret'
    }).configureSlackApp({
        clientId: env.CLIENT_ID,
        clientSecret: env.CLIENT_SECRET,
        scopes: ['bot', 'chat:write:user', 'chat:write:bot', 'files:write:user']
    });

    bot = controller.spawn({
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
}

exports.env = function(){
    if (env != null)
        return env;
    else
        return null;
}

exports.controller = function(){
    if (controller != null)
        return controller;
    else
        return null;
}

exports.bot = function(){
    if (bot != null)
        return bot;
    else
        return null;
}
