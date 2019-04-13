const AWS = require("aws-sdk");
const retext = require('retext')
const keywords = require("retext-keywords");
const toString = require('nlcst-to-string');
const unirest = require('unirest');

AWS.config.update({region: "us-east-1"});
const TABLE_NAME = "memory-bank";
const dbHelper = function () { };
const docClient = new AWS.DynamoDB.DocumentClient();
const EXCLUDE = ["what", "what's", "how", "how's", "when", "when's", "where", "where's"]


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
    const synonymPromiseList = [];
    const promise = new Promise((resolve, reject) => {

        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            //go through each item in the database to find a match
            data.Items.forEach((item) => {
                const spList = [];
                const match = findDBTextMatch(item.memoryQuestion, memory.question, synonymPromiseList);
                if(match==true)            
                    resolve(item);
                else {
                    match.then(synonymMatch => {
                        if(synonymMatch) 
                            resolve(item);
                    });
                }
            });
        });
    });
    synonymPromiseList.push(promise);
    return Promise.all(synonymPromiseList).then(resolvedItem => {
        return(resolvedItem.pop());
    });
}

const findDBTextMatch = (textDB, textIn, synonymPromiseList) => {
    let keywordList = [];
    populateKeywordList(keywordList, textIn);
    keywordList = keywordList.filter(i => !EXCLUDE.includes(i));
    let dbMemoryQuestionKeywords = [];
    populateKeywordList(dbMemoryQuestionKeywords, textDB);
    dbMemoryQuestionKeywords = dbMemoryQuestionKeywords.filter(i => !EXCLUDE.includes(i));

    console.log("Populated db keywords: \n");
    console.log(dbMemoryQuestionKeywords);
    if(dbMemoryQuestionKeywords.every(value => keywordList.includes(value))) {
        return true;                   
    } else {
        const similarityIndex =  applyDiceAndCosineSimilarity(textIn, textDB);
        console.log("Similarity Index: " + similarityIndex.toString());
        if(similarityIndex > 80)
            return true;                    
        else {
            const synonymPromise = applySynonymCheck(keywordList, dbMemoryQuestionKeywords).then(sIndex=>{
                console.log("Similarity Index with Synonyms: " + sIndex.toString());
                if(sIndex > 80)
                    return true;
                else
                    return false;
            });
            synonymPromiseList.push(synonymPromise);
            return synonymPromise;
        }
    }
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
                //if synonyms of a keyword matches with a keyword in database then
                // replace original with database value
                if (synonyms.includes(i)) {
                    kList[kList.indexOf(word)] = i;
                }
            });
        });
        synonymPromiseList.push(synonymPromise);
    });
    return Promise.all(synonymPromiseList).then(_ => {
        console.log("SIMILARITY CHECK:")
        console.log(kList);
        console.log(kList2);
        return applyDiceAndCosineSimilarity(kList.join(" "), kList2.join(" "));
    });
}

const populateKeywordList = (wordList, textInput) => {
    retext()
    .use(keywords)
    .process(textInput, (err, text) => {
        if (err) {
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

// CosineSimilarity
const consineSimilarity = (string1, string2) => {
    const {commonTerms, termsInString1, termsInString2} = parseForSimilarity(string1, string2)
    return (commonTerms / (Math.pow(termsInString1, 0.5) * Math.pow(termsInString2, 0.5)) * 100).toFixed(2);
}

//diceSimilarity
const diceSimilarity = (string1, string2) => {
    const {commonTerms, termsInString1, termsInString2} = parseForSimilarity(string1, string2)    
    return (((2 * commonTerms) / (termsInString1 + termsInString2)) * 100).toFixed(2);
}

// similarity caluclation helper function
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
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
}


module.exports = new dbHelper();