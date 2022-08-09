require('dotenv').config("./env");
var Airtable = require('airtable');
const channel = require('./message');


var base = new Airtable({ apiKey: process.env.apiKey }).base(process.env.base);

/**
 * 
 * @param {string} studentTable - Table name of a particular channel.
 * @param {string} contact - Primary field of the table
*/
async function getStudentNumbers(studentTable, contact) {

    var numbersToMessage = []

    const records = await base(`${studentTable}`).select({
        view: "Grid view"
    }).all();

    //Retrieve the number and push it into the array.
    records.forEach(function (record) {
        var number = record.get(contact)
        numbersToMessage.push(number)

    });

    // Remove duplicates from the array.
    numbersToMessage = await removeDuplicates(numbersToMessage)
    console.log(numbersToMessage)

    console.log(`Total Numbers in ${studentTable} ${numbersToMessage.length}`)

    // Execute sendContent on each number.
    for (let i = 0; i < numbersToMessage.length; i++) {
        sendContent(numbersToMessage[i], studentTable, contact).then().catch(e => console.log("E", e))
    }


}


/**
 * @param {number} number - Unique id of the student.
 * @param {string} studentTable - Table name of a channel
 * @param {string} contact - Primary field of the student table
 */
async function sendContent(number, studentTable, contact) {

    const records_Student = await base(`${studentTable}`).select({
        /*
        Eg: ({Phone = number}) 
        Here, Phone is the primary field of the student table  
        Number is the value of the primary field
        */

        filterByFormula: "({" + contact + "} =" + number + ")",
        view: "Grid view",
        maxRecords: 1

    }).all();

    // Get  total days in a particular course
    var td = await totalDays(number, studentTable, contact)

    records_Student.forEach(async function (record) {
        studentName = record.get("Name")
        completed_Day = record.get("Day Completed")

        /* Check if days completed by student is less than the total days in the course
        If yes, than send the start day template.
        Otherwise, the course is all the days in the course is completed by the student
        */

        if (completed_Day < td) {
            try {

                // Telegram-Students is the name of table in Airtable that contains the students information enrolled in a course on Telegram channel
                if (studentTable == "Telegram Students") {
                    channel.sendTelegramTemplate(studentName, number)
                }

                // WhatsApp Students is the name of table in Airtable that contains the students information enrolled in a course on WhatsApp.

                else if (studentTable == "WhatsApp Students") {
                    channel.sendTemplateMessage(studentName, number)

                }


            }
            catch (e) {
                console.log("sendContent error " + e)
            }
        }

    })

}

// Find total number of days in a given course.
/**
 * 
 * @param {number} number - Unique id of the student.
 * @param {*} studentTable - Table name of a particular channel.
 * @param {*} contact - Primary field of the table
 * @returns total number of days in a given course
 */
const totalDays = async (number, studentTable, contact) => {
    var course_tn = await findTable(number, studentTable, contact)

    const course_table = await base(`${course_tn}`).select({
        fields: ["Day"],
        view: "Grid view"
    }).all();
    return new Promise((resolve, reject) => {
        count = 0
        course_table.forEach(function (record) {
            count += 1

        })
        resolve(count)
        reject("Error")
    })

}

// Find the course table enrolled by the student
/**
 * 
 * @param {*} number - Unique id of the student.
 * @param {*} studentTable - Table name of a particular channel.
 * @param {*} contact - Primary field of the table.
 * @returns 
 */
const findTable = async (number, studentTable, contact) => {
    const course_table = await base(`${studentTable}`).select({
        filterByFormula: "({" + contact + "} = " + number + ")",
        view: "Grid view"
    }).all();

    return new Promise((resolve, reject) => {
        course_tn = ""
        course_table.forEach(function (record) {
            course_tn = record.get("Course")
            resolve(course_tn)
            reject("error")

        })
    })
}



function removeDuplicates(arr) {
    return new Promise((resolve, reject) => {
        resolve(arr.filter((item,
            index) => arr.indexOf(item) === index))
    })
}



try {
    getStudentNumbers("WhatsApp Students", "Phone")
    getStudentNumbers("Telegram Students", "ChatID")


}
catch (e) {
    console.log("error " + e)
}