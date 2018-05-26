// import * as env from '../secret/env';
let env = process.env;
import botkit from 'botkit';


// botkitの準備
export function setup() {

    if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
        console.log('Error: environment');
        process.exit(1);
    }

    let mongoStorage = mongo({mongoUri: env.MONGODB_URI});
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

    controller.setupWebserver(env.PORT || 8080, function (err, webserver) {
        controller.createWebhookEndpoints(controller.webserver);

        controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
            if (err) {
                res.status(500).send('ERROR: ' + err);
            } else {
                res.send('Success!');
            }
        });
    });

    return controller;
}
