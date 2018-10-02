const Alexa = require('alexa-sdk');
const mess  = require('./messages');
const func  = require('./functions');
//Current Live Skill ID -- Uncomment for live skill
const APPID = '(app id)';

//Dev Id -- Change for live Skill
//Local testing console command -- use event.json for requests
//testing: lambda-local -l index.js -h handler -e event.json

var analytics = require("voicelabs")('analytics id');

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APPID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// Feed Endpoints from Wordpress
const urlCA = "(end point)";
const urlCO = "(end point)";
const urlID = "(end point)";
const urlNM = "(end point)";
const urlUT = "(end point)";

//Alexa Intent Handler
const handlers = {
    'LaunchRequest': function () {

        let randomLaunchMessage = mess.launch[ func.randProp( mess.launch ) ];
        this.emit(":ask", randomLaunchMessage, mess.report.helpRepromt );

    },
    'AMAZON.HelpIntent': function () {
        analytics.track( this.event.session, "HelpIntent", (error, response) => {
            this.emit(':ask', mess.report.helpTell, mess.report.helpRepromt);
        });
    },
    'AMAZON.StopIntent': function () {
        
        let randomEndMessage = mess.end[ func.randProp( mess.end ) ];
        this.emit(":tell", randomEndMessage);
    },
    'AMAZON.CancelIntent': function () {
        analytics.track( this.event.session, "CancelIntent", (error, response) => {
            this.emit('AMAZON.StopIntent');
        });
    },
    'SessionEndedRequest': function () {
        analytics.track( this.event.session, "SessionEndedRequest", (error, response) => {
            this.emit('AMAZON.StopIntent');
        });
    },
    'Unhandled': function () {
        analytics.track( this.event.session, "Unhandled", (error, response) => {
            this.emit('AMAZON.HelpIntent');
        });
    },
    //Ask for available area
    'AvailableAreas': function () {

        let area  = func.resolveEnt( this.event.request.intent.slots.Available );
        let convertCase = area.toLowerCase();
        let feedEndpoint = "";

        if ( convertCase === "california" ) {
            feedEndpoint = urlCA;
        } else if ( convertCase === "colorado" ) {
            feedEndpoint = urlCO;
        } else if ( convertCase === "idaho" ) {
            feedEndpoint = urlID;
        } else if ( convertCase === "new mexico" ) {
            feedEndpoint = urlNM;
        } else if ( convertCase === "utah" ) {
            feedEndpoint = urlUT;
        } else {
            analytics.track( this.event.session, "AvailableAreaHelp", area, mess.report.availHelpAsk, (error, response) => {
                this.emit(":ask", mess.report.availHelpAsk, mess.report.availHelpRepromt );
            });
        }

        func.getEndpoint( feedEndpoint, ( response ) => {
            if ( response.length <= 0 ) {
                analytics.track( this.event.session, "AvailableAreaMissingFeed", area, mess.report.statusError, (error, response) => {
                    this.emit(":ask", mess.report.statusError, mess.report.helpRepromt );
                });
            } else {
                let areaName        = func.cleanKeys( response[0].acf  );
                let areaList        = func.sayArray( areaName, "and" );
                let areaResponse    = func.listAvailableArea( area, areaName, areaList );
                let areaReprompt    = func.listAvailableRepromt( area );
                
                analytics.track( this.event.session, "AvailableArea", area, areaResponse, (error, response) => {
                    this.emit(":ask", areaResponse, areaReprompt);
                });
            }
        });

    },
    //California
    'GetCAReport': function () {
        
        func.getEndpoint( urlCA, ( response ) => {
            let slot = func.resolveEnt( this.event.request.intent.slots.CAArea );

            if ( response.length <= 0 ) {
                analytics.track( this.event.session, "CAReportMissingFeed", slot, mess.report.statusError, (error, response) => {
                    this.emit(":ask", mess.report.statusError, mess.report.helpRepromt );
                });
            } else {
                let keyFromSlot     = slot.toLowerCase().split(' ').join('_'); 
                let intentTarget    = response[0].acf[keyFromSlot];
                let cardInfo        = func.cardInfo( slot );
                let cardErrorVoice  = func.cardErrorVoice( slot );
                let cardErrorText   = func.cardErrorText( slot );
                let audioTarget     = func.buildAudio( intentTarget );

                if ( intentTarget ) {
                    this.emit(":tellWithCard", audioTarget, mess.card.cardTitle, cardInfo, mess.image );
                    analytics.track( this.event.session, "GetCAReport", slot, audioTarget, (error, response) => {
                        this.emit(":tellWithCard", audioTarget, mess.card.cardTitle, cardInfo, mess.image );
                    });
                } else if ( intentTarget === undefined ) {
                    analytics.track( this.event.session, "GetCAReportUndefined", slot, cardErrorVoice, (error, response) => {
                        this.emit(":askWithCard", cardErrorVoice, mess.report.helpRepromt, mess.card.cardTitle, cardErrorText, mess.undefinedImage );
                    });
                } else {
                     analytics.track( this.event.session, "GetCAReportError", slot, mess.report.statusError, (error, response) => {
                        this.emit(":askWithCard", mess.report.statusError, mess.report.helpRepromt, mess.card.cardTitle, mess.report.statusErrorText, mess.statusErrorImage );
                    });
                }
            }
        });

    },
    //Colorado
    'GetCOReport': function () {

        func.getEndpoint( urlCO, ( response ) => {
            let slot = func.resolveEnt( this.event.request.intent.slots.COArea );

            if ( response.length <= 0 ) {
                analytics.track( this.event.session, "GetCOReportMissingFeed", slot, mess.report.statusError, (error, response) => {
                    this.emit(":ask", mess.report.statusError, mess.report.helpRepromt );
                });
            } else if ( slot === undefined) {
                analytics.track( this.event.session, "GetCOReportMissingSlot", slot, mess.report.helpTell, (error, response) => {
                    this.emit(":ask", mess.report.helpTell, mess.report.helpRepromt );
                });
            } else if ( slot == "backcountry" || slot == "Backcountry" ) {
                analytics.track( this.event.session, "GetCOReportBackcountry", mess.report.backcountyAsk, (error, response) => {
                    this.emit(":ask", mess.report.backcountyAsk, mess.report.backcountryRepromt );
                });
            } else {
                let keyFromSlot     = slot.toLowerCase().split(' ').join('_'); 
                let intentTarget    = response[0].acf[keyFromSlot];
                let cardInfo        = func.cardInfo( slot );
                let cardErrorVoice  = func.cardErrorVoice( slot );
                let cardErrorText   = func.cardErrorText( slot );
                let audioTarget     = func.buildAudio( intentTarget );

                if ( intentTarget ) {
                    analytics.track( this.event.session, "GetCOReport", slot, audioTarget, (error, response) => {
                        this.emit(":tellWithCard", audioTarget, mess.card.cardTitle, cardInfo, mess.image );
                    });
                } else if ( intentTarget === undefined ) {
                    analytics.track( this.event.session, "GetCOReportUndefined", slot, cardErrorVoice, (error, response) => {
                        this.emit(":askWithCard", cardErrorVoice, mess.report.helpRepromt, mess.card.cardTitle, cardErrorText, mess.undefinedImage );
                    });
                } else {
                     analytics.track( this.event.session, "GetCOReportError", slot, mess.report.statusError, (error, response) => {
                        this.emit(":askWithCard", mess.report.statusError, mess.report.helpRepromt, mess.card.cardTitle, mess.report.statusErrorText, mess.statusErrorImage );
                    });
                }
            }
        });

    },
    //Idaho Report
    'GetIDReport': function () {

        func.getEndpoint( urlID, ( response ) => {
            let slot = func.resolveEnt( this.event.request.intent.slots.IDArea );

            if ( response.length <= 0 ) {
                analytics.track( this.event.session, "GetIDReportMissingFeed", slot, mess.report.statusError, (error, response) => {
                    this.emit(":ask", mess.report.statusError, mess.report.helpRepromt );
                });
            } else {
                let keyFromSlot     = slot.toLowerCase().split(' ').join('_'); 
                let intentTarget    = response[0].acf[keyFromSlot];
                let cardInfo        = func.cardInfo( slot );
                let cardErrorVoice  = func.cardErrorVoice( slot );
                let cardErrorText   = func.cardErrorText( slot );
                let audioTarget     = func.buildAudio( intentTarget );

                if ( intentTarget ) {
                    analytics.track( this.event.session, "GetIDReport", slot, audioTarget, (error, response) => {
                        this.emit(":tellWithCard", audioTarget, mess.card.cardTitle, cardInfo, mess.image );
                    });
                } else if ( intentTarget === undefined ) {
                    analytics.track( this.event.session, "GetIDReportUndefined", slot, cardErrorVoice, (error, response) => {
                        this.emit(":askWithCard", cardErrorVoice, mess.report.helpRepromt, mess.card.cardTitle, cardErrorText, mess.undefinedImage );
                    });
                } else {
                    analytics.track( this.event.session, "GetIDReportError", slot, mess.report.statusError, (error, response) => {
                        this.emit(":askWithCard", mess.report.statusError, mess.report.helpRepromt, mess.card.cardTitle, mess.report.statusErrorText, mess.statusErrorImage );
                    });
                }
            }
        });

    },
    //New Mexico
    'GetNMReport': function () {

        func.getEndpoint( urlNM, ( response ) => {
            let slot = func.resolveEnt( this.event.request.intent.slots.NMArea );

            if ( response.length <= 0 ) {
                analytics.track( this.event.session, "GetNMReportMissingFeed", slot, mess.report.statusError, (error, response) => {
                    this.emit(":ask", mess.report.statusError, mess.report.helpRepromt );
                });
            } else {
                let keyFromSlot     = slot.toLowerCase().split(' ').join('_'); 
                let intentTarget    = response[0].acf[keyFromSlot];
                let cardInfo        = func.cardInfo( slot );
                let cardErrorVoice  = func.cardErrorVoice( slot );
                let cardErrorText   = func.cardErrorText( slot );
                let audioTarget     = func.buildAudio( intentTarget );

                if ( intentTarget ) {
                    analytics.track( this.event.session, "GetNMReport", slot, audioTarget, (error, response) => {
                        this.emit(":tellWithCard", audioTarget, mess.card.cardTitle, cardInfo, mess.image );
                    });
                } else if ( intentTarget === undefined ) {
                    analytics.track( this.event.session, "GetNMReportUndefined", slot, cardErrorVoice, (error, response) => {
                        this.emit(":askWithCard", cardErrorVoice, mess.report.helpRepromt, mess.card.cardTitle, cardErrorText, mess.undefinedImage );
                    });
                } else {
                    analytics.track( this.event.session, "GetNMReportError", slot, mess.report.statusError, (error, response) => {
                        this.emit(":askWithCard", mess.report.statusError, mess.report.helpRepromt, mess.card.cardTitle, mess.report.statusErrorText, mess.statusErrorImage );
                    });
                }
            }
        });

    },
    //Utah
    'GetUTReport': function () {

        func.getEndpoint( urlUT, ( response ) => {
            let slot = func.resolveEnt( this.event.request.intent.slots.UTArea );

            if ( response.length <= 0 ) {
                analytics.track( this.event.session, "GetUTReportMissingFeed", slot, mess.report.statusError, (error, response) => {
                    this.emit(":ask", mess.report.statusError, mess.report.helpRepromt );
                });
            } else {
                let keyFromSlot     = slot.toLowerCase().split(' ').join('_'); 
                let intentTarget    = response[0].acf[keyFromSlot];
                let cardInfo        = func.cardInfo( slot );
                let cardErrorVoice  = func.cardErrorVoice( slot );
                let cardErrorText   = func.cardErrorText( slot );
                let audioTarget     = func.buildAudio( intentTarget );

                if ( intentTarget ) {
                    analytics.track( this.event.session, "GetUTReport", slot, audioTarget, (error, response) => {
                        this.emit(":tellWithCard", audioTarget, mess.card.cardTitle, cardInfo, mess.image );
                    });
                } else if ( intentTarget === undefined ) {
                    analytics.track( this.event.session, "GetUTReportUndefined", slot, cardErrorVoice, (error, response) => {
                        this.emit(":askWithCard", cardErrorVoice, mess.report.helpRepromt, mess.card.cardTitle, cardErrorText, mess.undefinedImage );
                    });
                } else {
                    analytics.track( this.event.session, "GetUTReportError", slot, mess.report.statusError, (error, response) => {
                        this.emit(":askWithCard", mess.report.statusError, mess.report.helpRepromt, mess.card.cardTitle, mess.report.statusErrorText, mess.statusErrorImage );
                    });
                }
            }
        });

    }
};
