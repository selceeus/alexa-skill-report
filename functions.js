
const https = require('https');

module.exports = {
    //Random Object Property
    randProp: function ( obj ) {
        var result;
        var count = 0;
        for ( var prop in obj ) {
            if ( Math.random() < 1 / ++count ) {
               result = prop;
            }
        }
        return result;
    },
    //Get Wordpress Endpoint
    getEndpoint: function ( location, callback ) {
        https.get( location, res => {
            res.setEncoding("utf8");
              let body = "";
            res.on("data", data => {
              body += data;      
            });
            res.on("end", () => {
                body = JSON.parse(body);
                callback( body );
            });
        });
    },
    //Build clean list from json array keys
    cleanKeys: function ( feed ) {
        let jsonFeedKeys = Object.keys( feed ).toString();
        jsonFeedKeys = jsonFeedKeys.replace(/[_-]/g, " ").split(',');
        let clean = Array.from(jsonFeedKeys);
        return clean;
    },
    //Say Whole List of Items Available
    sayArray: function ( myData, penultimateWord = 'and' ) {
        let result = '';
        myData.forEach(function(element, index, arr) {
            if (index === 0) {
                result = element;
            } else if (index === myData.length - 1) {
                result += ` ${penultimateWord} ${element}`;
            } else {
                result += `, ${element}`;
            }
        });
        return result;
    },
    //Resolve entities to synonyms for slots 
    resolveEnt: function ( slot, useId ) {
        let value = slot.value;
        let resolution = (slot.resolutions 
            && slot.resolutions.resolutionsPerAuthority 
            && slot.resolutions.resolutionsPerAuthority.length > 0) 
            ? slot.resolutions.resolutionsPerAuthority[0] 
            : null;
        if ( resolution && resolution.status.code == 'ER_SUCCESS_MATCH' ) {
            let resolutionValue = resolution.values[0].value;
            value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
        } else {
            value = undefined;
        }
        return value;

    },
    //Build Audio Responses
    buildAudio: function( audio ) {
        let areaAudio = '<audio src=\"' + audio + '\" />';
        return areaAudio;
    },
    // Card and Speech Responses
    listAvailableArea: function( slotname, namearray, list ){
        let returnMessage = `We currently have ${ namearray.length } ski areas avaialble in ${ slotname }. The resorts available are ${ list }`;
        return returnMessage;
    },
    listAvailableRepromt: function( slotname ) {
        let returnMessage = `Ask for the resort from ${ slotname } to listen to it.`
        return returnMessage;
    },
    cardInfo: function ( area ) {
        let cap = area.charAt(0).toUpperCase();
        let remain = area.slice(1);
        let capWord = cap + remain;
        let returnMessage = `You listened to the ski report for ${capWord} are you going to head up to the slopes today?`;
        return returnMessage;
    },
    cardErrorVoice: function ( area ) {
        let returnMessage = `Sorry, not familiar with <emphasis level=\"strong\"> ${area} .</emphasis> <break time=\"1s\"/> Please ask again.`;
        return returnMessage;
    },
    cardErrorText: function ( area ) {
        let returnMessage = `Sorry, not familiar with ${area} . Please ask again.`;
        return returnMessage;
    }
};