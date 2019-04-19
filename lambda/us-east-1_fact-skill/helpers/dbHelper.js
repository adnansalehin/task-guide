const AWS = require("aws-sdk");
const retext = require('retext')
const keywords = require("retext-keywords");
const toString = require('nlcst-to-string');
const unirest = require('unirest');

AWS.config.update({region: "us-east-1"});
const TABLE_MEMORY = "memory-bank";
const TABLE_MOVIE = "dynamodb-starter";
const TABLE_ACTIVITY = "activity-store";
const TABLE_MEDICATION = "medication-store";
const TABLE_FAMILY = "family-store";
const dbHelper = function () { };
const docClient = new AWS.DynamoDB.DocumentClient();
const QUESTION_WORDS = [
    "what", "what's", "how", "how's", "when", "when's", "where", "where's",
    "who", "who's", "why", "why's"
]

// Start movie functions

dbHelper.prototype.addMovie = (movie, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MOVIE,
            Item: {
              'movieTitle' : movie,
              'subTitle': "sub text",
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if(err) {
                console.error("Unable to insert movie", JSON.stringify(err))
                return reject("Unable to add movie");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.getMovies = (userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MOVIE,
            KeyConditionExpression: "#userID = :user_id",
            ExpressionAttributeNames: {
                "#userID": "userId"
            },
            ExpressionAttributeValues: {
                ":user_id": userID
            }
        }
        docClient.query(params, (err, data) => {
            if(err) {
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
            TableName: TABLE_MOVIE,
            Key: {
                "userId": userID,
                "movieTitle": movie
            },
            ConditionExpression: "attribute_exists(movieTitle)"
        };
        docClient.delete(params, (err, data) => {
            if(err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("Delete movie succeeded:", JSON.stringify(data, null, 2));
            resolve();
        });
    });
}

// End movie functions

// Start memory functions

dbHelper.prototype.addMemory = (memory, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MEMORY,
            Item: {
              'memoryQuestion' : memory.question,
              'memoryAnswer' : memory.answer,
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if(err) {
                console.error("Unable to insert Memory", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.queryMemory = (memory, userID) => {
        
    const params = {
        TableName: TABLE_MEMORY,
        KeyConditionExpression: "#userID = :_id",
        ExpressionAttributeNames: {
            "#userID": "userId",
        },
        ExpressionAttributeValues: {
            ":_id": userID,
        }
    };

    let itemFound = false;
    const promiseList = [];
    const promise = new Promise((resolve, reject) => {

        docClient.query(params, (err, data) => {
            if(err) {
                console.error("Unable to read memory table. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2));
            }
            //go through each item in the database to find a match
            let i=1;
            data.Items.forEach(item => {
                promiseList.push(checkTextMatch(item.memoryQuestion, memory.question)
                    .then(match => {
                        if(match) {
                            itemFound = true;
                            resolve(item);
                        }
                        if(!itemFound && i >= data.Items.length) {
                            console.log("ITEM NOT FOUND");
                            resolve(false);
                        }
                        i++;
                    })
                );
            });
        });
    });
    promiseList.push(promise);
    return Promise.all(promiseList).then(result => result.pop());
}

dbHelper.prototype.removeMemory = (memory, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MOVIE,
            Key: {
                "userId": userID,
                "memoryQuestion": memory.question
            },
            ConditionExpression: "attribute_exists(memoryQuestion)"
        };
        docClient.delete(params, (err, data) => {
            if(err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("Delete memory succeeded:", JSON.stringify(data, null, 2));
            resolve();
        });
    });
}

// End memory functions

// Start activity functions

dbHelper.prototype.addActivity = (activity, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_ACTIVITY,
            Item: {
              'activityName' : activity.name,
              'activitySteps' : activity.steps,
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if(err) {
                console.error("Unable to insert Activity", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.queryActivity = (activity, userID) => {
        
    const params = {
        TableName: TABLE_ACTIVITY,
        KeyConditionExpression: "#userID = :_id",
        ExpressionAttributeNames: {
            "#userID": "userId",
        },
        ExpressionAttributeValues: {
            ":_id": userID,
        }
    };

    let itemFound = false;
    const promiseList = [];
    const promise = new Promise((resolve, reject) => {

        docClient.query(params, (err, data) => {
            if(err) {
                console.error("Unable to read activity table. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2));
            }
            //go through each item in the database to find a match
            let i=1;
            data.Items.forEach(item => {
                promiseList.push(checkTextMatch(item.activityName, activity.name)
                    .then(match => {
                        if(match) {
                            itemFound = true;
                            resolve(item);
                        }
                        if(!itemFound && i >= data.Items.length) {
                            console.log("ITEM NOT FOUND");
                            resolve(false);
                        }
                        i++;
                    })
                );
            });
        });
    });
    promiseList.push(promise);
    return Promise.all(promiseList).then(result => result.pop());
}

dbHelper.prototype.removeActivity = (activity, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MOVIE,
            Key: {
                "userId": userID,
                "activityName": activity.name
            },
            ConditionExpression: "attribute_exists(activityName)"
        };
        docClient.delete(params, (err, data) => {
            if(err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("Delete activity succeeded:", JSON.stringify(data, null, 2));
            resolve();
        });
    });
}

// End activity functions

// Start medication functions

dbHelper.prototype.addMedication = (medication, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MEDICATION,
            Item: {
              'medicationName' : medication.name,
              'medicationDosage' : medication.dosage,
              'medicationFrequency' : medication.frequency,
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if(err) {
                console.error("Unable to insert Medication", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.queryMedication = (medication, userID) => {
        
    const params = {
        TableName: TABLE_MEDICATION,
        KeyConditionExpression: "#userID = :_id",
        ExpressionAttributeNames: {
            "#userID": "userId",
        },
        ExpressionAttributeValues: {
            ":_id": userID,
        }
    };

    let itemFound = false;
    const promiseList = [];
    const promise = new Promise((resolve, reject) => {

        docClient.query(params, (err, data) => {
            if(err) {
                console.error("Unable to read medication table. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2));
            }
            //go through each item in the database to find a match
            let i=1;
            data.Items.forEach(item => {
                promiseList.push(checkTextMatch(item.medicationName, medication.name)
                    .then(match => {
                        if(match) {
                            itemFound = true;
                            resolve(item);
                        }
                        if(!itemFound && i >= data.Items.length) {
                            console.log("ITEM NOT FOUND");
                            resolve(false);
                        }
                        i++;
                    })
                );
            });
        });
    });
    promiseList.push(promise);
    return Promise.all(promiseList).then(result => result.pop());
}

dbHelper.prototype.removeMedication = (medication, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MOVIE,
            Key: {
                "userId": userID,
                "medicationName": medication.name
            },
            ConditionExpression: "attribute_exists(medicationName)"
        };
        docClient.delete(params, (err, data) => {
            if(err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("Delete medication succeeded:", JSON.stringify(data, null, 2));
            resolve();
        });
    });
}

// End medication functions

// Start familyMember functions

dbHelper.prototype.addFamilyMember = (familyMember, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_FAMILY,
            Item: {
              'familyMemberName' : familyMember.name,
              'familyMemberRelationship' : familyMember.relationship,
              'familyMemberFact' : familyMember.fact,
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if(err) {
                console.error("Unable to insert Family Member", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

//find family member info by any atribute the user wants. e.g. a fact about them, their relationship with the user, etc.
dbHelper.prototype.queryFamilyMember = (attributeName, attributeValue, userID) => {
    
    const params = {
        TableName: TABLE_FAMILY,
        KeyConditionExpression: "#userID = :_id",
        ExpressionAttributeNames: {
            "#userID": "userId",
        },
        ExpressionAttributeValues: {
            ":_id": userID,
        }
    };

    let itemFound = false;
    const promiseList = [];

    const promise = new Promise((resolve, reject) => {

        docClient.query(params, (err, data) => {
            if(err) {
                console.error("Unable to read familyMember table. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2));
            }
            //go through each item in the database to find a match
            let i=1;
            data.Items.forEach(item => {
                promiseList.push(checkTextMatch(getFamilyDBText(item, attributeName), attributeValue)
                    .then(match => {
                        if(match) {
                            itemFound = true;
                            resolve(item);
                        }
                        if(!itemFound && i >= data.Items.length) {
                            console.log("ITEM NOT FOUND");
                            resolve(false);
                        }
                        i++;
                    })
                );
            });
        });
    });
    promiseList.push(promise);
    return Promise.all(promiseList).then(result => result.pop());
}

dbHelper.prototype.removeFamilyMember = (familyMember, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: TABLE_MOVIE,
            Key: {
                "userId": userID,
                "familyMemberName": familyMember.name
            },
            ConditionExpression: "attribute_exists(familyMemberName)"
        };
        docClient.delete(params, (err, data) => {
            if(err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("Delete familyMember succeeded:", JSON.stringify(data, null, 2));
            resolve();
        });
    });
}

// End familyMember functions


// Start helper functions

const getFamilyDBText = (item, attributeName) => {
    switch(attributeName) {
        case "name":
            return item.familyMemberName;
        case "relationship":
            return item.familyMemberRelationship;
        case "fact":
            return item.familyMemberFact;
        default:
            return item.familyMemberName;
    }
}

//Text/Sentence matching function
const checkTextMatch = (dbText, utteredText) => {
    
    return new Promise((resolve, reject) => {
        if(dbText==utteredText)
            resolve(true);
        else {
            let utteredSentenceKeywords = [];
            populateKeywordList(utteredSentenceKeywords, utteredText);
            utteredSentenceKeywords = utteredSentenceKeywords.filter(i => !QUESTION_WORDS.includes(i));
            let dbSentenceKeywords = [];
            populateKeywordList(dbSentenceKeywords, dbText);
            dbSentenceKeywords = dbSentenceKeywords.filter(i => !QUESTION_WORDS.includes(i));

            if(dbSentenceKeywords.every(value => utteredSentenceKeywords.includes(value)))
                resolve(true);
            else {
                const similarityIndex =  applyDiceAndCosineSimilarity(utteredText, dbText);
                console.log("Similarity Index: " + similarityIndex.toString());
                if(similarityIndex > 80)
                    resolve(true);                    
                else {
                    applySynonymCheck(utteredSentenceKeywords, dbSentenceKeywords).then(sIndex => {
                        console.log("Similarity Index with Synonyms: " + sIndex.toString());
                        if(sIndex > 80)
                            resolve(true);
                        else
                            resolve(false);
                    });
                }
            }
        }
    });
}  

const getSynonyms = word => {
    return new Promise((resolve, reject) => {
        unirest.get("https://wordsapiv1.p.mashape.com/words/" + word + "/synonyms")
            .header("X-RapidAPI-Host", "wordsapiv1.p.rapidapi.com")
            .header("X-RapidAPI-Key", "6865f7788bmsh4f19be9d2d7d470p1e7111jsn3f116a171e48")
            .end(function(result) {
                resolve(result.body.synonyms);
            });
    });
}

const applySynonymCheck = (kList, kList2) => {
    const synonymPromiseList = [];
    kList.forEach(word => {
        const synonymPromise = getSynonyms(word).then(synonyms => {
            kList2.forEach(i => {
                // if synonyms of a keyword matches with a keyword in database then replace original with database value
                if(synonyms.includes(i)) {
                    kList[kList.indexOf(word)] = i;
                }
            });
        });
        synonymPromiseList.push(synonymPromise);
    });
    return Promise.all(synonymPromiseList).then(() => applyDiceAndCosineSimilarity(kList.join(" "), kList2.join(" ")));
}

const populateKeywordList = (wordList, textInput) => {
    retext()
    .use(keywords)
    .process(textInput, (err, text) => {
        if(err) {
            console.error("Failed to extract keywords");
        } else {
            text.data.keywords.forEach(keyword => {
                wordList.push(toString(keyword.matches[0].node).replace("\'s", ""));
            });
        }
    });
}

const applyDiceAndCosineSimilarity = (string1, string2) => {
    const c = parseFloat(consineSimilarity(string1, string2));
    const d = parseFloat(diceSimilarity(string1, string2));
    return (c+d)/2;
}

// Cosine Similarity
const consineSimilarity = (string1, string2) => {
    const {commonTerms, termsInString1, termsInString2} = parseForSimilarity(string1, string2)
    return (commonTerms / (Math.pow(termsInString1, 0.5) * Math.pow(termsInString2, 0.5)) * 100).toFixed(2);
}

// Dice Similarity
const diceSimilarity = (string1, string2) => {
    const {commonTerms, termsInString1, termsInString2} = parseForSimilarity(string1, string2)    
    return (((2 * commonTerms) / (termsInString1 + termsInString2)) * 100).toFixed(2);
}

// Similarity caluclation helper function
const parseForSimilarity = (string1, string2) => {

    const arr1 = cleanString(string1).split(/\s+/);
    const arr2 = cleanString(string2).split(/\s+/);

    let allTokensSet = removeDuplicates(arr1);
    const termsInString1 = allTokensSet.length;

    const secondStringTokensSet = removeDuplicates(arr2);
    const termsInString2 = secondStringTokensSet.length;

    const tempArr = arr1.concat(arr2);
    allTokensSet = removeDuplicates(tempArr);
    const commonTerms = (termsInString1 + termsInString2) - allTokensSet.length;
    
    return {commonTerms, termsInString1, termsInString2}
}

const cleanString = stringIn => {
    const temp = stringIn.trim().toLowerCase();
    const re = /([   ]{1,})/g;
    const temp1 = temp.replace(re, " ");
    return temp1;
}

//remove duplicate elements in the array
const removeDuplicates = array => {

    var newArray = [], provisionalTable = {};
    for (var i = 0, item; (item = array[i]) != null; i++) {
        if(!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
}


module.exports = new dbHelper();