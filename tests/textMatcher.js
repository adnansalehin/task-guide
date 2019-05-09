const retext = require("retext");
const keywords = require("retext-keywords");
const pos = require("retext-pos");
const toString = require("nlcst-to-string");
const unirest = require("unirest");
const rake = require("rake-js").default;
const translator = require("american-british-english-translator");
const QUESTION_WORDS = [
  "what",
  "what's",
  "how",
  "how's",
  "when",
  "when's",
  "where",
  "where's",
  "who",
  "who's",
  "why",
  "why's"
];
const RAPID_API_KEY = "6865f7788bmsh4f19be9d2d7d470p1e7111jsn3f116a171e48";

//Text/Sentence matching function
const checkTextMatch = (dbText, utteredText) => {
  return new Promise((resolve, reject) => {
    if (dbText == utteredText) resolve(true);
    else {
      let utteredSentenceKeywords = [];
      populateKeywordList(utteredSentenceKeywords, utteredText);
      utteredSentenceKeywords = utteredSentenceKeywords.filter(
        i => !QUESTION_WORDS.includes(i)
      );
      let dbSentenceKeywords = [];
      populateKeywordList(dbSentenceKeywords, dbText);
      dbSentenceKeywords = dbSentenceKeywords.filter(
        i => !QUESTION_WORDS.includes(i)
      );
        console.log(utteredSentenceKeywords);
        console.log(dbSentenceKeywords);
      if (
        dbSentenceKeywords.every(value =>
          utteredSentenceKeywords.includes(value)
        )
      ) resolve(true);
      else {
        const similarityIndex = applyDiceAndCosineSimilarity(
          utteredText,
          dbText
        );
        console.log("Similarity Index: " + similarityIndex.toString());
        if (similarityIndex > 80) resolve(true);
        else {
          console.log(utteredSentenceKeywords);
          console.log(JSON.stringify(dbSentenceKeywords));

          //testing performance without keyword extraction
          applySynonymCheck(utteredText.split(" "), dbText.split(" ")).then(
            sIndex => {
              console.log(
                "Similarity Index with Synonyms: " + sIndex.toString()
              );
              if (sIndex > 80) resolve(true);
              else resolve(false);
            }
          );
        }
      }
    }
  });
};

const getSynonyms = word => {
  return new Promise((resolve, reject) => {
    console.log("getting synonyms for:   " +word);
    unirest
      .get("https://wordsapiv1.p.mashape.com/words/" + word + "/synonyms")
      .header("X-RapidAPI-Host", "wordsapiv1.p.rapidapi.com")
      .header("X-RapidAPI-Key", RAPID_API_KEY)
      .end(function(result) {
        result.body.synonyms? resolve(result.body.synonyms) : resolve([]);
      });
  });
};

const applySynonymCheck = (kList, kList2) => {
  const synonymPromiseList = [];
  kList.forEach(word => {
    const synonymPromise = getSynonyms(word).then(synonyms => {
      kList2.forEach(i => {
        // if synonyms of a keyword matches with a keyword in database then replace original with database value
        if (synonyms.includes(i)) {
          
          console.log(`replacing this word: ${word} with: ${i}`);
          kList[kList.indexOf(word)] = i;
        }
        // console.log(`Synonyms: ${synonyms}`);
      });
    });
    synonymPromiseList.push(synonymPromise);
  });
  return Promise.all(synonymPromiseList).then(() =>
    applyDiceAndCosineSimilarity(kList.join(" "), kList2.join(" "))
  );
};

const populateKeywordList = (wordList, textInput) => {
  const translatedText = translateEnglishUStoEnglishUK(textInput);
  console.log(`after translation: ${translatedText}`);
  retext()
    .use(keywords)
    .process(translatedText, (err, text) => {
      if (err) {
        console.error("Failed to extract keywords");
      } else {
        const rakeWords = new Set(rake(translatedText, { language: 'english' }));
        rakeWords.forEach(keyword => {
          keyword.split(" ").map(word => rakeWords.add(word));
        });
        text.data.keywords.forEach(keyword => {
          rakeWords.add(toString(keyword.matches[0].node));
        });
        rakeWords.forEach(item => wordList.push(item));
      }
    });
};

const populateKeywordListWithoutRake = (wordList, textInput) => {
  const translatedText = translateEnglishUStoEnglishUK(textInput);
  console.log(`after translation: ${translatedText}`);
  retext()
    .use(keywords)
    .process(translatedText, (err, text) => {
      if (err) {
        console.error("Failed to extract keywords");
      } else {
        text.data.keywords.forEach(keyword => {
          wordList.push(toString(keyword.matches[0].node));
        });
      }
    });
};

const translateEnglishUStoEnglishUK = text => {
  const translateAmerican = translator.translate(text, { american: true });
  if (translateAmerican[1]){
    translateAmerican[1].forEach(word => {
      usWord = Object.keys(word)[0];
      if(word[usWord].issue=="American English Spelling") {
        ukWord = word[usWord].details;
        if(typeof usWord == "string" && typeof ukWord == "string")
          text = text.replace(usWord, ukWord);
      }
    });
  }
  return text;
};

const applyDiceAndCosineSimilarity = (string1, string2) => {
  const c = parseFloat(consineSimilarity(string1, string2));
  const d = parseFloat(diceSimilarity(string1, string2));
  return (c + d) / 2;
};

// Cosine Similarity
const consineSimilarity = (string1, string2) => {
  const { commonTerms, termsInString1, termsInString2 } = parseForSimilarity(
    string1,
    string2
  );
  return (
    (commonTerms /
      (Math.pow(termsInString1, 0.5) * Math.pow(termsInString2, 0.5))) *
    100
  ).toFixed(2);
};

// Dice Similarity
const diceSimilarity = (string1, string2) => {
  const { commonTerms, termsInString1, termsInString2 } = parseForSimilarity(
    string1,
    string2
  );
  return (
    ((2 * commonTerms) / (termsInString1 + termsInString2)) *
    100
  ).toFixed(2);
};

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
  const commonTerms = termsInString1 + termsInString2 - allTokensSet.length;

  return { commonTerms, termsInString1, termsInString2 };
};

const cleanString = stringIn => {
  const temp = stringIn.trim().toLowerCase();
  const re = /([   ]{1,})/g;
  const temp1 = temp.replace(re, " ");
  return temp1;
};

//remove duplicate elements in the array
const removeDuplicates = array => {
  var newArray = [],
    provisionalTable = {};
  for (var i = 0, item; (item = array[i]) != null; i++) {
    if (!provisionalTable[item]) {
      newArray.push(item);
      provisionalTable[item] = true;
    }
  }
  return newArray;
};
// checkTextMatch("name?", "call").then(match => {
//     console.log(match);
// });
var inspect = require("unist-util-inspect");
var visit = require("unist-util-visit");

const retextTense = word => {
  var proc = retext().use(pos);
  var tree = proc.run(proc.parse(word));
  tree.then(r => {
    console.log(JSON.stringify(r));
    console.log(JSON.stringify(r.children[0].children[0].children[0].data.partOfSpeech));

  });
  visit(tree, "WordNode", function(node) {
    // console.log(tree);

    console.log(node.data.partOfSpeech);
  });
  retext()
  .use(keywords)
  // .use(pos)
  // .use(function() {
  //     return transformer
  //     function transformer(tree) {
  //       console.log(inspect(tree))
  //     }
  //   })
  // .process(word)
  // .then(x => console.log(x));
  .process(word, (err, text) => {
      if(err) {
          console.error("Failed to extract keywords");
      } else {
          text.data.keywords.forEach(keyword => {
             console.log(keyword);
          });
      }
  }); 
};

// retextTense("my boy name");

// getSynonyms("meditation").then(l=> console.log(l));
// getSynonyms("wannphonea").then(l=> console.log(l));
// getSynonyms("food").then(l=> console.log(l));
// getSynonyms("number").then(l=> console.log(l));
// getSynonyms("childhood").then(l=> console.log(l));
// getSynonyms("child").then(l=> console.log(l));
// getSynonyms("mother").then(l=> console.log(l));

const str2 = "We will go play chess";
const str1 = "We will go play football";

// const str1 = "my favorite cat";
// const str2 = "my favourite dog";
// checkTextMatch(str1, str2).then(match => console.log(match)); 
let utteredSentenceKeywords = [];
let utteredSentenceKeywords2 = [];
s="I take this medicine by mixing it with water";

populateKeywordList(utteredSentenceKeywords, s);
console.log(utteredSentenceKeywords);

populateKeywordListWithoutRake(utteredSentenceKeywords2, s);
console.log(utteredSentenceKeywords2);
// console.log(translateEnglishUStoEnglishUK("favorite"));