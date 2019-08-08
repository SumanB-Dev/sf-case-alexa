"use strict";

let salesforce = require("./salesforce");

exports.CreateCase = (slots, session, response) => {
    session.attributes.stage = "ask_subject";
    response.ask("OK,Please help me with some information. Tell me the subjcet for the case");
};

exports.AnswerSubject = (slots, session, response) => {
    if (session.attributes.stage === "ask_subject") {
        session.attributes.subject = slots.subject.value;
        session.attributes.stage = "ask_description";
        response.ask("Allright! Now please give me brief description of your problem");
    } else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.AnswerDesription = (slots, session, response) => {
    if (session.attributes.stage === "ask_description") {
        session.attributes.description = slots.description.value;
        session.attributes.stage = "ask_priority";
        response.ask("What is priority for this ? High, Medium or Low");
    } 
    else {
        response.say("Sorry, I didn't understand that");
    }
};
    
exports.AnswerPriority = (slots, session, response) => {    
    if (session.attributes.stage === "ask_priority") {
        let priority = slots.priority.value;
        session.attributes.priority = priority;


        //build salesforce logic here
        salesforce.createCase({subject: session.attributes.subject, description: session.attributes.description, priority: session.attributes.priority})
            .then(createdCase => {
                if (createdCase) {
                    let text = `Now relax, your case has been logged succesfully. Your case number is ${createdCase.get("CaseNumber")}`;
                    response.say(text);
                } else {
                    response.say(`Sorry, I was not able to create your case. Please take a coffee and come back`);
                }
            })
            .catch((err) => {
                console.error(err);
                response.say("Oops. Something went wrong");
            });

       /*salesforce.findProperties({city: session.attributes.city, bedrooms: session.attributes.bedrooms, priceMin: priceMin, priceMax: priceMax})
            .then(properties => {
                if (properties && properties.length>0) {
                    let text = `OK, here is what I found for ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around $${price}: `;
                    properties.forEach(property => {
                        text += `${property.get("Address__c")}, ${property.get("City__c")}: $${property.get("Price__c")}. <break time="0.5s" /> `;
                    });
                    response.say(text);
                } else {
                    response.say(`Sorry, I didn't find any ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around ${price}.`);
                }
            })
            .catch((err) => {
                console.error(err);
                response.say("Oops. Something went wrong");
            }); */
    } 
    else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.Changes = (slots, session, response) => {
    salesforce.findPriceChanges()
        .then(priceChanges => {
            let text = "OK, here are the recent price changes: ";
            priceChanges.forEach(priceChange => {
                    let property = priceChange.get("Parent");
                    text += `${property.Address__c}, ${property.City__c}.<break time="0.2s"/>
                            Price changed from $${priceChange.get("OldValue")} to $${priceChange.get("NewValue")}.<break time="0.5s"/>`;
            });
           response.say(text);
        })
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};