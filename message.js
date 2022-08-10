var request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(BOT_TOKEN);

require('dotenv').config("./env")

/**
 * 
 * @param {string} name - Student Name
 * @param {number} number - ChatID of the student
 * @returns 
 */
async function sendTelegramTemplate(name, number) {
    return new Promise((resolve, reject) => {
        var templateMessage = `Hello ${name},
Welcome to the FREE business training program - WomenWill! 

Click below to start.`
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Start",
                            callback_data: 'Start'
                        }
                    ]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
            }
        };
        bot.sendMessage(number, templateMessage, opts);
        // console.log(res)
        resolve("ok")
        reject(number)

    })
}

/**
 * 
 * @param {string} name - Student name
 * @param {number} number - Phone number of the student
 * @returns 
 */
function sendTemplateMessage(name, senderID) {
    params = [{ 'name': "name", 'value': name }]
    var options = {
        'method': 'POST',
        'url': 'https://' + process.env.URL + '/api/v1/sendTemplateMessage/' + senderID,
        'headers': {
            'Authorization': process.env.WATI_access_token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "template_name": "template_start",
            "broadcast_name": "broadcast_name",
            "parameters": JSON.stringify(params)
        })

    };
    request(options, function (error, response) {
        body = JSON.parse(response.body)
        result = body.result
        if (error || result == false)
            console.log("WATI error " + response.body)

        console.log("Res " + result);
    });
}
module.exports = {
    sendTemplateMessage,
    sendTelegramTemplate
}

