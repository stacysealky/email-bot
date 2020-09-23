const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parser');
const os = require('os');

const resultArray = [];

readFromCSV('input.csv').then((webpages) => {
    promiseArray = webpages.map((webpage) => {
        return axios.get(webpage)
            .then((result) => {
                const rawMailList = getEmailsFromPage(result.data);
                const mailList = makeUnique(rawMailList);
                
                mailList.length ? resultArray.push(webpage) : null;
                resultArray.push(...mailList);
                console.log(`found ${mailList.length} emails for ${webpage}`);
                
            }, (err) => {
                console.log("Cannot get webpage: ", webpage);
            })
    });

    Promise.all(promiseArray).then(() => {
        const finalString = resultArray.join(os.EOL);
        fs.writeFile("output.csv", finalString, (err) => {
            if(err) {
                return console.log("Could not write to output file");
            }
        
            console.log("output.csv file was created!");
        }); 
    })
});

function getEmailsFromPage(webContent) {
    const emailRegEx = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
    const match = webContent.match(emailRegEx);

    return match ? match : [];
}

function makeUnique(list) {
    return list.filter((v, i, a) => a.indexOf(v) === i);
}

function readFromCSV(inputFilePath) {
    return new Promise((resolve, reject) => {
        const websites = [];
        if (fs.existsSync(inputFilePath)) {
            fs.createReadStream(inputFilePath)
            .pipe(csv({headers: false}))
            .on('data', function (data) {
                try {
                    websites.push(data[0]);
                }
                catch (err) {
                    reject(err);
                    console.log("Reading From File Error");
                }
            })
            .on('end', function () {
                console.log("Read from CSV complete");
                resolve(websites);
            })
            .on('error', () => console.log(`error reading ${inputFilePath} file`));
        } else {
            console.log(`File not found! ${inputFilePath} does not exist`);
        }

    });
}
