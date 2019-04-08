const AWS = require("aws-sdk");
const retext = require('retext')
const keywords = require("retext-keywords");
const toString = require('nlcst-to-string');

AWS.config.update({region: "us-east-1"});
const TABLE_NAME = "memory-bank";
const dbHelper = function () { };
const docClient = new AWS.DynamoDB.DocumentClient();
const EXCLUDE = ["what", "what's", "how", "how's", "when", "when's", "where", "where's"]

dbHelper.prototype.addMemory = (memory, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_NAME,
            Item: {
              'memoryQuestion' : memory.question,
              'memoryAnswer' : memory.answer,
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.queryMemory = (memory, userID) => {
    return new Promise((resolve, reject) => {
        const keywordList = [];
        populateKeywordList(keywordList, memory.question);
        
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "#userID = :_id",
            ExpressionAttributeNames: {
                "#userID": "userId",
            },
            ExpressionAttributeValues: {
                ":_id": userID,
            }
        };
        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            let resolvedItem;
            data.Items.forEach((item) => {
                const dbMemoryQuestionKeywords = [];
                populateKeywordList(dbMemoryQuestionKeywords, item.memoryQuestion);
                console.log("Populated db keywords: \n");
                console.log(dbMemoryQuestionKeywords);
                if(dbMemoryQuestionKeywords.every(value => keywordList.includes(value))) {
                    console.log("MATCH");
                    console.log("resolvedItem: ");
                    console.log(item);
                    resolvedItem = item;
                }
            });
            resolve(resolvedItem);
        });
    });
}

dbHelper.prototype.addMovie = (movie, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_NAME,
            Item: {
              'movieTitle' : movie,
              'subTitle': "sub text",
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.getMovies = (userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "#userID = :user_id",
            ExpressionAttributeNames: {
                "#userID": "userId"
            },
            ExpressionAttributeValues: {
                ":user_id": userID
            }
        }
        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.removeMovie = (movie, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "userId": userID,
                "movieTitle": movie
            },
            ConditionExpression: "attribute_exists(movieTitle)"
        }
        docClient.delete(params, (err, data) => {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            resolve()
        })
    });
}

const populateKeywordList = (keywordList, textInput) => {
    retext()
    .use(keywords)
    .process(textInput, (err, text) => {
        if (err) {
            console.error("Failed to extract keywords");
        } else {
            text.data.keywords.forEach(keyword => {
                keywordList.push(toString(keyword.matches[0].node));
            })
            keywordList = keywordList.filter(i => !EXCLUDE.includes(i));
        }
    });
}

module.exports = new dbHelper();