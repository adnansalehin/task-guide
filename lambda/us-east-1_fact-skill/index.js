/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const dbHelper = require('./helpers/dbHelper');
const GENERAL_REPROMPT = "What would you like to do next?";
const GENERAL_HELP_REPROMPT = "What would you like to do?";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Hello! You can say memories... or activities... or movies... or medication... or family... to find out about these features';
    const repromptText = 'What would you like to do? You can say help to learn more';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const InProgressAddMovieIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AddMovieIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
};

const AddMovieIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddMovieIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder} = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const movieName = slots.MovieName.value;
    return dbHelper.addMovie(movieName, userID)
      .then((data) => {
        const speechText = "You have successfully added the movie " + movieName + ". You can say add movie to add another one";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("Error occured while saving movie", err);
        const speechText = "we cannot save your movie right now. Try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const GetMoviesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetMoviesIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    return dbHelper.getMovies(userID)
      .then((data) => {
        var speechText = "Your movies are "
        if (data.length == 0) {
          speechText = "You do not have any favourite movies yet, add a movie by saving add movie"
        } else {
          speechText += data.map(e => e.movieTitle).join(", ")
        }
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "we cannot get your movie right now. Try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  }
};

const InProgressRemoveMovieIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'RemoveMovieIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
};

const RemoveMovieIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveMovieIntent';
  }, 
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const movieName = slots.MovieName.value;
    return dbHelper.removeMovie(movieName, userID)
      .then((data) => {
        const speechText = "You have removed movie with name " + movieName;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "You don't have " + movieName + " in your list of favourite movies";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
  }
};

//memory intents

const InProgressAddMemoryIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AddMemoryIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
};

const AddMemoryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddMemoryIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const memory = {
      question: slots.MemoryQuestion.value,
      answer: slots.MemoryAnswer.value
    };
    console.log(slots);
    return dbHelper.addMemory(memory, userID)
      .then((data) => {
        const speechText = "You have successfully added that memory. You can say add memory to add another one or remove memory to remove a memory";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while saving memory", err);
        const speechText = "Sorry, I could not save your memory right now. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const QueryMemoryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QueryMemoryIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const memory = {
      question: slots.MemoryQuestion.value,
    };
    return dbHelper.queryMemory(memory, userID)
      .then(data => {
        const speechText = data.memoryAnswer || "Sorry I couldn't find an answer to that memory. Try saying add memory to add that memory";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your memory", err);
        const speechText = "Sorry I couldn't find an answer to that memory. Try saying add memory to add that memory"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const EditMemoryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'EditMemoryIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const memory = {
      question: slots.MemoryQuestion.value,
      answer: slots.MemoryAnswer.value
    };
    return dbHelper.editMemory(memory, userID)
      .then(data => {
        const speechText = "Saved changes! " + data.memoryAnswer + " is now the answer for " + memory.question;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your memory", err);
        const speechText = "Sorry I couldn't find that memory. Try saying add memory to add that memory"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const RemoveMemoryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveMemoryIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const memory = {
      question: slots.MemoryQuestion.value
    };
    return dbHelper.removeMemory(memory, userID)
      .then(data => {
        const speechText = "Successfully deleted memory with question " + memory.question;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your memory", err);
        const speechText = "Sorry, I couldn't delete that memory."
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

//end memory intents

//activity intents

const AddActivityIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddActivityIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const activity = {
      name: slots.ActivityName.value,
      steps: slots.ActivitySteps.value
    };

    return dbHelper.addActivity(activity, userID)
      .then((data) => {
        const speechText = "You have successfully added that activity. You can say add activity to add another one";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while saving activity", err);
        const speechText = "Sorry, I could not save your activity right now. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const QueryActivityIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QueryActivityIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const activity = {
      name: slots.ActivityName.value,
    };
    return dbHelper.queryActivity(activity, userID)
      .then(data => {
        const speechText = "The steps for the activity " + activity.name + " is " + data.activitySteps || "Sorry I couldn't find the steps to that activity. Try saying add activity to add that activity";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your activity", err);
        const speechText = "Sorry I couldn't find the steps to that activity. Try saying add activity to add that activity"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const EditActivityIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'EditActivityIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const activity = {
      name: slots.ActivityName.value,
      steps: slots.ActivitySteps.value
    };
    return dbHelper.editActivity(activity, userID)
      .then(data => {
        const speechText = "Saved changes! " + data.activitySteps + " is now the steps for " + activity.name;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your activity", err);
        const speechText = "Sorry I couldn't find that activity. Try saying add activity to add that activity"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const RemoveActivityIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveActivityIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const activity = {
      name: slots.ActivityName.value
    };
    return dbHelper.removeActivity(activity, userID)
      .then(data => {
        const speechText = "Successfully deleted the activity " + activity.name;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your activity", err);
        const speechText = "Sorry, I couldn't delete that activity."
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

//end activity intents

//start medication intents

const AddMedicationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddMedicationIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const medication = {
      name: slots.MedicationName.value,
      frequency: slots.MedicationFrequency.value,
      dosage: slots.MedicationDosage.value,
      time: slots.MedicationTime.value     
    };

    return dbHelper.addMedication(medication, userID)
      .then((data) => {
        const speechText = "You have successfully added that medication information. You can say add medication to add another one... If the steps to adminster this medicine is too complicated, you can add an activity for it with the steps described";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while saving medication details", err);
        const speechText = "Sorry, I could not save your medication details right now. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const QueryMedicationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QueryMedicationIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const medication = {
      name: slots.MedicationName.value,
    };
    return dbHelper.queryMedication(medication, userID)
      .then(data => {
        const speechText = "You should take " + data.medicationName + "... " + data.medicationFrequency + " at " + data.medicationTime || "Sorry I couldn't find that medicine. Try saying add medication to add that medicine";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your medication", err);
        const speechText = "Sorry I couldn't find that medicine. Try saying add medication to add that medicine"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const EditMedicationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'EditMedicationIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const medication = {
      name: slots.MedicationName.value,
      frequency: slots.MedicationFrequency.value,
      dosage: slots.MedicationDosage.value,
      time: slots.MedicationTime.value
    };
    return dbHelper.editMedication(medication, userID)
      .then(data => {
        let speechText = "";
        if(medication.name)
          speechText = "Successfully saved changes for " + medication.name;
        else
          speechText = "You had not saved that medicine before. Try saying add medication to add it."
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your medication", err);
        const speechText = "Sorry I couldn't find that medication. Try saying add medication to add that medication"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const RemoveMedicationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveMedicationIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const medication = {
      name: slots.MedicationName.value
    };
    return dbHelper.removeMedication(medication, userID)
      .then(data => {
        const speechText = "Successfully deleted medication with name " + medication.name;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your medication", err);
        const speechText = "Sorry, I couldn't delete that medication."
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

//end medication intents

//start family member intents

const AddFamilyMemberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddFamilyMemberIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const familyMember = {
      name: slots.FamilyMemberName.value,
      relationship: slots.FamilyMemberRelationship.value,
      fact: slots.FamilyMemberFact.value
    };

    return dbHelper.addFamilyMember(familyMember, userID)
      .then((data) => {
        const speechText = "You have successfully added " + familyMember.name + ". You can say add family member or friend to add another person";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while saving family member", err);
        const speechText = "Sorry, I could not save the family member or friend information. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const QueryFamilyMemberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QueryFamilyMemberIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const familyMember = {
      attributeName: slots.AttributeName.value, // name || relationship || fact
      attributeValue: slots.AttributeValue.value,
    };
    return dbHelper.queryFamilyMember(familyMember.attributeName, familyMember.attributeValue, userID)
      .then(data => {
        let speechText;
        if(data.familyMemberFact == "N/A")
          speechText = "The person you're thinking of is " + data.familyMemberName + "... who is your " + data.familyMemberRelationship;
        else
          speechText = "The person you're thinking of is " + data.familyMemberName + "... who is your " + data.familyMemberRelationship
          + "... an interesting fact about " + data.familyMemberName + " is that " + data.familyMemberFact;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your family member", err);
        const speechText = "Sorry I couldn't find that family member. Try saying add family member to add that family member"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const EditFamilyMemberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'EditFamilyMemberIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const familyMember = {
      name: slots.FamilyMemberName.value,
      relationship: slots.FamilyMemberRelationship.value,
      fact: slots.FamilyMemberFact.value
    };
    return dbHelper.editFamilyMember(familyMember, userID)
      .then(data => {
        const speechText = "Successfully saved changes for " + familyMember.name;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your family member", err);
        const speechText = "Sorry I couldn't find that family member. Try saying add family member to add that family member"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const RemoveFamilyMemberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveFamilyMemberIntent';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const familyMember = {
      name: slots.FamilyMemberName.value
    };
    return dbHelper.removeFamilyMember(familyMember, userID)
      .then(data => {
        const speechText = "Successfully deleted " + familyMember.name + " from your list.";
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("An error occured while retrieving your family member", err);
        const speechText = "Sorry, I couldn't delete that family member."
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

//end family member intents

//user help intents

const MoviesHelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MoviesHelpIntent';
  },
  handle(handlerInput) {
    const speechText = "Welcome to the favourite movies feature... You can say add movie to add a new movie... get movies to help you remember all your favorite movies... or say delete movie to delete a movie";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(GENERAL_HELP_REPROMPT)
      .getResponse();
  },
};

const MemoriesHelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MemoriesHelpIntent';
  },
  handle(handlerInput) {
    const speechText = "Welcome to the memories feature... You can say add memory to add a new memory... chnage memory to change an existing memory... delete memory to delete a memory or say remind me to help you remember a memory";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(GENERAL_HELP_REPROMPT)
      .getResponse();
  },
};

const ActivitiesHelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ActivitiesHelpIntent';
  },
  handle(handlerInput) {
    const speechText = "Welcome to the activities feature... You can say add activity to add a new activity... edit activity to change the steps for an activity... get activity to help you remember the steps... or say delete activity to delete an activity";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(GENERAL_HELP_REPROMPT)
      .getResponse();
  },
};

const MedicationHelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MedicationHelpIntent';
  },
  handle(handlerInput) {
    const speechText = "Welcome to the medication feature... You can say add medicine to add a new medicine... edit medicine to change the details for a medicine... get medicine to help you remember the details... or say delete medicine to delete a medicine";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(GENERAL_HELP_REPROMPT)
      .getResponse();
  },
};

const FamilyHelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FamilyHelpIntent';
  },
  handle(handlerInput) {
    const speechText = "Welcome to the family and friends feature... You can say add family member to add a new family member... edit family member to change the details for a family member... get family member to help you remember the details... or say delete family member to delete a family member... You can also use the word friend instead of family member for these commands";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(GENERAL_HELP_REPROMPT)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = "This skill offers five distinct features. memories... activities... movies... medication... and family.. You can add, change, help you recall or delete information about all of these.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(GENERAL_HELP_REPROMPT)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log("Session ended with reason: ${handlerInput.requestEnvelope.request.reason}");

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. You can say help to find out more commands.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressAddMemoryIntentHandler,
    AddMemoryIntentHandler,
    QueryMemoryIntentHandler,
    EditMemoryIntentHandler,
    RemoveMemoryIntentHandler,
    InProgressAddMovieIntentHandler,
    AddMovieIntentHandler,
    GetMoviesIntentHandler,
    InProgressRemoveMovieIntentHandler,
    RemoveMovieIntentHandler,
    // InProgressAddActivityIntentHandler,
    AddActivityIntentHandler,
    QueryActivityIntentHandler,
    EditActivityIntentHandler,
    RemoveActivityIntentHandler,
    AddMedicationIntentHandler,
    QueryMedicationIntentHandler,
    EditMedicationIntentHandler,
    RemoveMedicationIntentHandler,
    AddFamilyMemberIntentHandler,
    QueryFamilyMemberIntentHandler,
    EditFamilyMemberIntentHandler,
    RemoveFamilyMemberIntentHandler,
    MoviesHelpIntentHandler,
    MemoriesHelpIntentHandler,
    ActivitiesHelpIntentHandler,
    MedicationHelpIntentHandler,
    FamilyHelpIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();