import * as express from 'express';
import * as builder from 'botbuilder';
import { Handoff } from './handoff';
import { commandsMiddleware } from './commands';

//=========================================================
// Bot Setup
//=========================================================

const app = express();

// Setup Express Server
app.listen(parseInt(process.env.port) || parseInt(process.env.PORT) || 3978, '::', () => {
    console.log('Server Up');
});
// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, [
    function (session, args, next) {
        session.send('Echo ' + session.message.text);
    }
]);

app.post('/api/messages', connector.listen());

// Create endpoint for agent / call center
app.use('/webchat', express.static('public'));

// replace this function with custom login/verification for agents
const isAgent = (session: builder.Session) => 
    session.message.user.name.startsWith("Agent");

const handoff = new Handoff(bot, isAgent);

//========================================================
// Bot Middleware
//========================================================
bot.use(
    commandsMiddleware(handoff),
    handoff.routingMiddleware(),
    /* other bot middlware should probably go here */
);

