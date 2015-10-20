// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';   
// At least Safari 3+: "[object HTMLElementConstructor]"
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// Chrome 1+
var isChrome = !!window.chrome && !isOpera;         
// At least IE6     
var isIE = /*@cc_on!@*/false || !!document.documentMode; 
// iOS device
var isIOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) !== null;
// Android device
var isAndroid = navigator.userAgent.match(/android/i) !== null;

(function(document, Timer, Speedometer) {
  'use strict';

// initial sign
var sign = document.getElementById('sign');

// NumPad Buttons
var bSet = document.getElementById('set-button');
var bOne = document.getElementById('button-one');
var bTwo = document.getElementById('button-two');
var bThree = document.getElementById('button-three');
var bFour = document.getElementById('button-four');
var bFive = document.getElementById('button-five');
var bSix = document.getElementById('button-six');
var bSeven = document.getElementById('button-seven');
var bEight = document.getElementById('button-eight');
var bNine = document.getElementById('button-nine');
var bZero = document.getElementById('button-zero');

// Audio
var introAudio = document.getElementById("intro-audio");
var winAudio = document.getElementById("win-audio");
var winAudio2 = document.getElementById("win-audio-2");
var winAudio3 = document.getElementById("win-audio-3");
var circuitStartAudio = document.getElementById("tc-start-audio");
var circuitStopAudio = document.getElementById("tc-stop-audio");
var circuitSetAudio = document.getElementById("tc-set-audio");
var circuitFailureAudio = document.getElementById("tc-failure-audio");
var numPad0123audio = document.getElementById("num-pad-0123");
var numPad456audio = document.getElementById("num-pad-456");
var numPad789audio = document.getElementById("num-pad-789");
var deloreanDoorAudio = document.getElementById("delorean-door");
var deloreanTimeTravelAudio = document.getElementById("delorean-time-travel");

// Easter egg
var heart = document.getElementById("heart");


var panel = {
    DESTINATION_TIME: 0,
    PRESENT_TIME: 1,
    LAST_TIME_DEPARTED: 2
};

var timeCircuit = {

    isOn:                   false,
    isTimeUpdated:          false,
    timer:                  Timer,
    speedometer:            Speedometer, 
    selectedValuesBuffer:   "",

    //model
    panelsTimeValues:       ["", "", ""],
    panelsTimeAmPm:         ["", "", ""],

    //introduced destionation Time
    introducedDestinationTimeValues:  "",
    introducedDestinationTimeAmPm:    "",
    
    keyDownAllowed:         true,
    sugars:                 [], 

    init: function () {
        this.isOn = false;

        // Another easter egg
        console.log("%c If my calculations are correct, when this baby hits eighty-eight miles per hour... you're gonna see some serious shit :) ", 'color: white; background: red');

        // Objects      
        this.timer.init();
        this.speedometer.init();
        
        // KeyListeners
        this.addKeysListeners();
        
        // delorean listeners
        this.initDeloreanListeners();

        // time circuit listener
        this.initTimeCircuitListeners();

        // sugars
        this.initSugars();

        // local storage
        if(typeof(Storage) !== "undefined") {
            if (!localStorage.getItem("lastTimeDeparted-Date")) {
                localStorage.setItem("lastTimeDeparted-Date", "OCT2619850121");
                localStorage.setItem("lastTimeDeparted-AmPm", clockSystem.AM);
            }
        } else {
            // TODO Sorry! No Web Storage support..
        }

        // init audio and start animations when DOM is completely loaded
        docReady(function () {
            // user first touch
            sign.addEventListener('click', timeCircuit.firstTouch);
        });

    },

    firstTouch: function () {
        timeCircuit.removeSignEventListener();
        // audio
        timeCircuit.initAudio();

          setTimeout(window.scrollTo(0,1),0);


        document.getElementById('sign-line-two').innerHTML += String.fromCharCode(13) + "The Future?";

        // FIX this little delay (to load and prepare all sounds for mobiles)
        setTimeout(function () {
                timeCircuit.startInitialAnimations();  
            }, 100);
        
    },

    startInitialAnimations: function () {
        document.querySelector('footer').className = "footer-animate";

        setTimeout(function () {
            introAudio.currentTime = 0;
            introAudio.play();   
            sign.className = "hide";        
        }, 1300);

        setTimeout(function () {
            deloreanDoorAudio.currentTime = 0;
            deloreanDoorAudio.play();
            document.getElementById('door-shine').className = "door-shine-on";
        }, 8000);
        
    },

    removeSignEventListener: function () {
        sign.removeEventListener('click', timeCircuit.firstTouch);
    },

    initDeloreanListeners: function () {
        document.getElementById('speedometer').addEventListener('click', function() {
            var isEnabled = timeCircuit.speedometer.toogleOnOff();
            var pedal = document.getElementById('pedal');
            if (isEnabled) {
                pedal.onmousedown = function () {
                    timeCircuit.speedometer.startAcceleration();
                }
                pedal.onmouseup = function () {
                    timeCircuit.speedometer.startDeceleration();
                }
                pedal.addEventListener('focus',function(){
                    this.blur();
                });
                pedal.className = "noselect on";
                document.addEventListener('reachEightyEightMPH', function () {
                    timeCircuit.didReachEightyEightMPH();
                });
            } else {
                pedal.onmouseup = null;
                pedal.onmousedown = null;

                pedal.removeEventListener('focus',function(){
                    this.blur();
                });
                pedal.className = "noselect";
                document.removeEventListener('reachEightyEightMPH', function () {
                    timeCircuit.didReachEightyEightMPH();
                });
            }
            
        });

    },

    initTimeCircuitListeners: function () {
        document.getElementById('time-circuit').addEventListener('click', function() {
            timeCircuit.toogleOnOff();
        });

        // TODO FIXME -moz doesnt support
        //Object.observe(this.timer, this.didMinuteChange, ['update']);
        
    },

    initAudio: function () {
        introAudio.volume = 0;
        winAudio.volume = 0;
        winAudio2.volume = 0;
        winAudio3.volume = 0;
        circuitStartAudio.volume = 0;
        circuitStopAudio.volume = 0;
        circuitSetAudio.volume = 0;
        circuitFailureAudio.volume = 0;
        numPad0123audio.volume = 0;
        numPad456audio.volume = 0;
        numPad789audio.volume = 0;
        deloreanDoorAudio.volume = 0;
        deloreanTimeTravelAudio.volume = 0;

        timeCircuit.prepareAudioForPlay(deloreanDoorAudio);
        timeCircuit.prepareAudioForPlay(introAudio);
        timeCircuit.prepareAudioForPlay(winAudio);
        timeCircuit.prepareAudioForPlay(winAudio2);
        timeCircuit.prepareAudioForPlay(winAudio3);
        timeCircuit.prepareAudioForPlay(circuitStartAudio);
        timeCircuit.prepareAudioForPlay(circuitStopAudio);
        timeCircuit.prepareAudioForPlay(circuitSetAudio);
        timeCircuit.prepareAudioForPlay(circuitFailureAudio);
        timeCircuit.prepareAudioForPlay(numPad0123audio);
        timeCircuit.prepareAudioForPlay(numPad456audio);
        timeCircuit.prepareAudioForPlay(numPad789audio);
        timeCircuit.prepareAudioForPlay(deloreanTimeTravelAudio);

        introAudio.volume = 0.1;
        winAudio.volume = 0.5;
        winAudio2.volume = 0.5;
        winAudio3.volume = 0.5;
        deloreanDoorAudio.volume = 0.5;
        circuitStartAudio.volume = 0.5;
        circuitStopAudio.volume = 0.5;
        circuitSetAudio.volume = 0.5;
        circuitFailureAudio.volume = 0.5;
        numPad0123audio.volume = 0.5;
        numPad456audio.volume = 0.7;
        numPad789audio.volume = 0.4;
        deloreanTimeTravelAudio.volume = 1;

    },

    prepareAudioForPlay: function (audio) {
        // When the audio is ready to play, immediately pause.
        audio.addEventListener('play', timeCircuit.pauseAndRemoveAudioListener, false);
        audio.play();
    },

    pauseAndRemoveAudioListener: function () {
        this.pause();
        this.removeEventListener('play', timeCircuit.pauseAndRemoveAudioListener, false);
    },

    //callback
    didMinuteChange: function(){
        if (timeCircuit.introducedDestinationTimeValues == "") {
            timeCircuit.setValuesToPanel(timeCircuit.timer.getDate(), 
                                                timeCircuit.timer.getAmPm(), 
                                                panel.DESTINATION_TIME,
                                                500);
        }
        timeCircuit.setValuesToPanel(timeCircuit.timer.getDate(), 
                                            timeCircuit.timer.getAmPm(), 
                                            panel.PRESENT_TIME,
                                            500);

        // check for sugars
        timeCircuit.checkForSugars(timeCircuit.panelsTimeValues[panel.PRESENT_TIME], 
                                    timeCircuit.panelsTimeAmPm[panel.PRESENT_TIME]);
    },

/*
    //callback with Object.observe 
    didMinuteChange: function(changes){
        changes.forEach(function(change) {
             //console.log(change.type, change.name, change.oldValue);
            if (change.type === "update" && change.name === "date"){
                timeCircuit.isTimeUpdated = false;
            }
        });
        if(!timeCircuit.isTimeUpdated){
            //TODO update destination time
            if (timeCircuit.introducedDestinationTimeValues == "") {
                timeCircuit.setValuesToPanel(timeCircuit.timer.getDate(), 
                                                timeCircuit.timer.getAmPm(), 
                                                panel.DESTINATION_TIME,
                                                500);
            }
            timeCircuit.setValuesToPanel(timeCircuit.timer.getDate(), 
                                            timeCircuit.timer.getAmPm(), 
                                            panel.PRESENT_TIME,
                                            500);
        }
        timeCircuit.isTimeUpdated = true;
    },
*/
    isOn: function () {
        return this.isOn;
    },

    toogleOnOff: function (){
        this.isOn = !this.isOn;
    	if (this.isOn){
            this.start();
        } else {
            this.stop();
	   }
    },

    start: function () {
        //this.isTimeUpdated = false;
        document.getElementById('time-machine').className = "on";
        //audio
        circuitStartAudio.currentTime = 0;
        circuitStartAudio.play();
        
        // timer
        document.addEventListener('minuteChange', function () {
            timeCircuit.didMinuteChange();
        });
        this.timer.start();
        
        //numpad
        this.addButtonsListeners();

        // leds
        setTimeout(function () {
            timeCircuit.turnOnTimeSeparatorLeds();
            timeCircuit.initPanelsData();
        }, 500); 
        
        
    },

    initPanelsData: function () {
        this.introducedDestinationTimeValues = "";
        // set DESTINATION TIME panel
        this.setValuesToPanel(timeCircuit.timer.getDate(),
            timeCircuit.timer.getAmPm(),
            panel.DESTINATION_TIME, 0);
        // set PRESENT TIME panel
        this.setValuesToPanel(timeCircuit.timer.getDate(),
            timeCircuit.timer.getAmPm(),
            panel.PRESENT_TIME, 0);
        // set LAST TIME DEPARTED panel
        if(typeof(Storage) !== "undefined") {
            this.setValuesToPanel(localStorage.getItem("lastTimeDeparted-Date"),
                                  localStorage.getItem("lastTimeDeparted-AmPm"),
                                  panel.LAST_TIME_DEPARTED, 0);
        } else {
            this.setValuesToPanel("OCT2619850121",
                                  clockSystem.AM,
                                  panel.LAST_TIME_DEPARTED, 0);
        }
    },

    stop: function () {
        document.getElementById('time-machine').className = "off";
        //audio
        circuitStopAudio.currentTime = 0;
        circuitStopAudio.play();

        // timer
        this.timer.stop();
        document.removeEventListener('minuteChange', function () {
            timeCircuit.didMinuteChange();
        });

        // numpad
        this.removeButtonsListeners();

        // leds
        this.turnOffAllLeds();

        // clean data
        this.clearAllPanels();
        this.selectedValuesBuffer = "";
        timeCircuit.introducedDestinationTimeValues = "";
        timeCircuit.updateSelectedValuesBufferTextField();
    },

    addKeysListeners: function () {
        //NumPad Keys
        //document.onkeypress = this.processPressedKey;
        window.onkeydown = this.processKeyDown;
        window.onkeyup = this.processKeyUp;
    },

    removeKeysListeners: function () {
        //NumPad Keys
        //document.onkeypress = null;
        window.onkeydown = null;
        window.onkeyup = null;
    },

    addButtonsListeners: function (){
        //Easter egg
        heart.addEventListener('click', this.sayHelloWorld);
        //Set button
        bSet.addEventListener('mousedown', this.setBufferToPanel);
        bSet.addEventListener("mouseup", this.stopSetButtonLight);
        //NumPad
        //TODO addEventListener to parent and manage buttons events
        bOne.addEventListener('click', this.storePressedNumber);
        bTwo.addEventListener('click', this.storePressedNumber);
        bThree.addEventListener('click', this.storePressedNumber);
        bFour.addEventListener('click', this.storePressedNumber);
        bFive.addEventListener('click', this.storePressedNumber);
        bSix.addEventListener('click', this.storePressedNumber);
        bSeven.addEventListener('click', this.storePressedNumber);
        bEight.addEventListener('click', this.storePressedNumber);
        bNine.addEventListener('click', this.storePressedNumber);
        bZero.addEventListener('click', this.storePressedNumber);
        
    },

    removeButtonsListeners: function (){
        //Easter egg
        heart.removeEventListener('click', this.sayHelloWorld);
        //Set button
        bSet.removeEventListener('mousedown', this.setBufferToPanel);
        bSet.addEventListener("mouseup", this.stopSetButtonLight);
        //NumPad
        bOne.removeEventListener('click', this.storePressedNumber);
        bTwo.removeEventListener('click', this.storePressedNumber);
        bThree.removeEventListener('click', this.storePressedNumber);
        bFour.removeEventListener('click', this.storePressedNumber);
        bFive.removeEventListener('click', this.storePressedNumber);
        bSix.removeEventListener('click', this.storePressedNumber);
        bSeven.removeEventListener('click', this.storePressedNumber);
        bEight.removeEventListener('click', this.storePressedNumber);
        bNine.removeEventListener('click', this.storePressedNumber);
        bZero.removeEventListener('click', this.storePressedNumber);
        
    },

    /*
    
        Callback who check time travel.

    */

    didReachEightyEightMPH: function () {
        // if correct destination time values introduced
        if (timeCircuit.introducedDestinationTimeValues != "" && timeCircuit.isOn) { 
            console.log('88 MPH --> Time Travel!!!');
            // play time travel audio    
            deloreanTimeTravelAudio.currentTime = 0;
            deloreanTimeTravelAudio.play();    
            // animate background
            document.body.className = "time-traveling";

            // update LAST time departed
            timeCircuit.setValuesToPanel(timeCircuit.panelsTimeValues[panel.PRESENT_TIME], timeCircuit.panelsTimeAmPm[panel.PRESENT_TIME], panel.LAST_TIME_DEPARTED, 0);
            // local storage
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem("lastTimeDeparted-Date", timeCircuit.panelsTimeValues[panel.LAST_TIME_DEPARTED]);
                localStorage.setItem("lastTimeDeparted-AmPm", timeCircuit.panelsTimeAmPm[panel.LAST_TIME_DEPARTED]);
            }

            // update PRESENT time
            timeCircuit.timer.newTimeTravel(timeCircuit.introducedDestinationTimeValues, timeCircuit.introducedDestinationTimeAmPm);
            
            // check for sugars
            //timeCircuit.checkForSugars(timeCircuit.introducedDestinationTimeValues, timeCircuit.introducedDestinationTimeAmPm);

            // clean introducedDestinationTimeValues 
            timeCircuit.introducedDestinationTimeValues = "";
            setTimeout(function() {
                // end animation
                document.body.className = "";
            }, 4000);
        } else {
            console.log('88 MPH --> No Destination Time Values');
        }
    },

    updateSelectedValuesBufferTextField: function () {
        document.getElementById('textfield').value = timeCircuit.selectedValuesBuffer;
    },

    processKeyDown: function (e) {
        var key = window.Event ? e.which : e.keyCode;
        var isExpectedKey = false;
        if (timeCircuit.isOn) {
            if (key >= 48 && key <= 57) { // numbers
                isExpectedKey = true;
                timeCircuit.storePressedNumber(e, key - 48);
            } else if (key === 13) { // enter
                timeCircuit.setBufferToPanel();
            }
        }
        if (timeCircuit.speedometer.isOn) {
            if (key === 32 || key === 38) { // space: 32  -  up arrow: 38 
                isExpectedKey = true;
                if (e.repeat != undefined) {
                    timeCircuit.keyDownAllowed = !e.repeat;
                }
                if (!timeCircuit.keyDownAllowed) {
                    return;
                }
                timeCircuit.keyDownAllowed = false;
                timeCircuit.speedometer.startAcceleration();
            }
        }
        if (isExpectedKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
    },

    processKeyUp: function (e) {
        var key = window.Event ? e.which : e.keyCode;
        if (timeCircuit.isOn) {
            if (key === 13) { // enter
                timeCircuit.stopSetButtonLight();
            }
        }
        if (timeCircuit.speedometer.isOn) {    
            if (key === 32 || key === 38) { // space: 32  -  up arrow: 38 
                timeCircuit.speedometer.startDeceleration();
                timeCircuit.keyDownAllowed = true;
            }  
        }
        //return false;
    },

    storePressedNumber: function (e, pressedNumber) {
        if (pressedNumber === undefined){
            pressedNumber = Number(this.innerHTML);
        }
        if (timeCircuit.selectedValuesBuffer.length == 12) {
            timeCircuit.selectedValuesBuffer = "";
        }
        timeCircuit.selectedValuesBuffer += pressedNumber;
        timeCircuit.updateSelectedValuesBufferTextField();
        // play sound
        if (pressedNumber < 4) {
            numPad0123audio.currentTime = 0;
            numPad0123audio.play();
        } else if (pressedNumber < 7){
            numPad456audio.currentTime = 0;
            numPad456audio.play();
        } else {
            numPad789audio.currentTime = 0;
            numPad789audio.play();
        }
    },

    setBufferToPanel: function (){  
        document.getElementById('rect-gray').className = 'rect on';
        if (timeCircuit.validateBufferData()) {
            // play OK audio
            circuitSetAudio.currentTime = 0;
            circuitSetAudio.play();
            // send buffer data to DESTIONATION TIME panel
            timeCircuit.setValuesToPanel(timeCircuit.introducedDestinationTimeValues, timeCircuit.introducedDestinationTimeAmPm, panel.DESTINATION_TIME, 0);
        } else {
            // play failure
            timeCircuit.setValuesFailureAnimation();         
        }
        // free and update buffer
        timeCircuit.selectedValuesBuffer = "";
        timeCircuit.updateSelectedValuesBufferTextField(); 
    },

    validateBufferData: function () {
        // Must be at least 8, 10 or 12 digit values: Month + Day + Year + Hour + Min
        if (timeCircuit.selectedValuesBuffer.length > 7) {   
            var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DIC'];
            var month = Number(timeCircuit.selectedValuesBuffer.substring(0, 2));
            var day = Number(timeCircuit.selectedValuesBuffer.substring(2, 4));
            var year = Number(timeCircuit.selectedValuesBuffer.substring(4, 8));
            var hour = 0;
            var min = 0; 
            var second = 0; 
            var amPm = clockSystem.AM;
            var offset = new Date().getTimezoneOffset();
            var date = new Date(Date.UTC(year, month - 1, day, hour, min - offset, second));

            if (date) { 
                // year overflow
                var fullYear = date.getFullYear();
                if (year < 100) {
                    fullYear -= 1900; 
                }
                // check if is a valid Date object to know if are valid day and month
                if (date.getMonth() != month - 1 || date.getUTCDate() != day || fullYear != year) {
                    return false;
                }
                // month
                month = months[month - 1];

                // hour and amPm
                if (timeCircuit.selectedValuesBuffer.length > 9) {
                    hour = Number(timeCircuit.selectedValuesBuffer.substring(8, 10));
                    amPm = clockSystem.AM;
                    if (hour > 23) { // wrong input
                        hour = '12';
                    } else if (hour > 11 && hour < 24) {
                        amPm = clockSystem.PM;
                        hour = hour % 12;
                    } 
                    if (hour == 0) {   // am system clock
                        hour = 12;
                    }
                    hour = "" + hour;
                    if (hour.length === 1) { // format
                        hour = '0' + hour;
                    }
                    // minutes
                    if (timeCircuit.selectedValuesBuffer.length > 11) {
                        min = Number(timeCircuit.selectedValuesBuffer.substring(10, 12));
                        if (min > 59) { // wrong input
                            min = '00';
                        }
                        min = "" + min; 
                        if (min.length === 1) { // format
                            min = '0' + min;
                        }
                    } else {
                        min = '00';
                    } 
                } else {  // default time
                    hour = '12';
                    min = '00';
                }

                // concat all date values
                var values = String(month + timeCircuit.selectedValuesBuffer.substring(2, 8) + hour + min);
                
                // store values
                timeCircuit.introducedDestinationTimeValues = values;
                timeCircuit.introducedDestinationTimeAmPm = amPm;

                return true;
            }
        }
        return false;
    },

    getValuesFromPanel: function (panelId) {
        var selectedPanel = this.getPanelById(panelId);
        if(selectedPanel === undefined || selectedPanel == null){ 
            return;
        }
        var digits = Array.prototype.slice.call(selectedPanel.querySelectorAll(".digit-value"));
        var values = values.split('');
    },

    setValuesToPanel: function (values, amPm, panelId, delay) {
        var selectedPanel = this.getPanelById(panelId);
        if(selectedPanel === undefined || selectedPanel == null){ 
            return;
        }
        var digits = Array.prototype.slice.call(selectedPanel.querySelectorAll(".digit-value"));      
        
        var valuesArray = values.split('');
        if (valuesArray.length !== digits.length) { 
            return;
        }

        timeCircuit.panelsTimeValues[panelId] = values;
        timeCircuit.panelsTimeAmPm[panelId] = amPm;

        setTimeout(function () {
                timeCircuit.setValuesAnimation(valuesArray, digits, values.length - 1);
                timeCircuit.setAmPm(amPm, panelId);
            },delay);
        
    },

    setValuesAnimation: function (values, digits, index) {
        if (values.length < index) { 
            return;
        }
        if (values[index] === " ") {
            digits[index].innerHTML = '8';
            digits[index].className = 'digit-value digit-hidden';
        } else {
            digits[index].innerHTML = values[index];
            digits[index].className  = 'digit-value digit-visible';
        }

        if (index--) {
            setTimeout(function () {
                timeCircuit.setValuesAnimation(values, digits, index);
            },5);
        }
    },

    setValuesFailureAnimation: function () {
        circuitFailureAudio.currentTime = 0;
        circuitFailureAudio.play();
        timeCircuit.selectedValuesBuffer = "";
        timeCircuit.updateSelectedValuesBufferTextField();

        var digits = Array.prototype.slice.call(document.querySelectorAll("#time-circuit .digit-value"));
        digits.forEach(function (element) {
            element.className  = 'digit-value failure';
        });
        digits.forEach(function (element) {
            setTimeout(function () {
                element.className  = 'digit-value';
            },500);
        });
    },

    stopSetButtonLight: function () {
        document.getElementById('rect-gray').className = 'rect';
    },

    turnOffAllLeds: function () {
    	var leds = Array.prototype.slice.call(document.getElementsByClassName("led"));
        leds.forEach(function (element) {
            element.className  = 'led off';
        });
    },

    turnOffledsById: function (panelId){
        var selectedPanel = this.getPanelById(panelId);
        if(selectedPanel === undefined || selectedPanel == null){ 
            return;
        }
        var leds = Array.prototype.slice.call(selectedPanel.getElementsByClassName("led"));
        leds.forEach(function (element) {
            element.className  = 'led off';
        });
    },

    turnOffAmPmLedsById: function (panelId){
        var selectedPanel = this.getPanelById(panelId);
        if(selectedPanel === undefined || selectedPanel == null){ 
            return;
        }
        var leds = Array.prototype.slice.call(selectedPanel.querySelectorAll(".am-pm-wrapper .led"));
        leds.forEach(function (element) {
            element.className  = 'led off';
        });
    },

    turnOnTimeSeparatorLeds: function (){
        for (var i = 0; i < 3; i++) {
            var selectedPanel = this.getPanelById(i);
            var query = ".time-separator-wrapper .led";
            var timeSeparatorLeds = Array.prototype.slice.call(selectedPanel.querySelectorAll(query));
            timeSeparatorLeds.forEach(function (element) {
                element.className  = "led on " + timeCircuit.getColorById(i) + " flashing";
            });
        }
    },

    getPanelById: function (panelId){
        switch(Number(panelId)) {
        case panel.DESTINATION_TIME:
            return document.getElementById("destination-time");

        case panel.PRESENT_TIME:
            return document.getElementById("present-time");

        case panel.LAST_TIME_DEPARTED:
            return document.getElementById("last-time-departed");

        default:
            return null;
        }
    },

    getColorById: function (panelId){
        switch(Number(panelId)) {
        case panel.DESTINATION_TIME:
            return "red";

        case panel.PRESENT_TIME:
            return "green";

        case panel.LAST_TIME_DEPARTED:
            return "orange";

        default:
            return "null";
        }
    },



    setAmPm: function (amPm, panelId){
        var selectedPanel = this.getPanelById(panelId);
        if(selectedPanel === undefined || selectedPanel == null){ 
            return;
        }
        var selectedAmPm;
        switch(Number(amPm)) {
            case clockSystem.AM:
                selectedAmPm = 2;
                break;

            case clockSystem.PM:
                selectedAmPm = 4;
                break;

            default:
                return;    
        }
        timeCircuit.turnOffAmPmLedsById(panelId);
        var query = ".am-pm-wrapper .wrapper:nth-child(" + selectedAmPm + ") .led";
        var led = selectedPanel.querySelector(query);
        led.className = 'led on ' + timeCircuit.getColorById(panelId);
    },

    clearPanel: function (panelId) {
        this.setValuesToPanel("             ", "-1", panelId, 500);
    },

    clearAllPanels: function () {
        this.clearPanel(panel.DESTINATION_TIME);
        this.clearPanel(panel.PRESENT_TIME);
        this.clearPanel(panel.LAST_TIME_DEPARTED);
    },

    initSugars: function () {
        // Sweet Dates from http://backtothefuture.wikia.com/wiki/Back_to_the_Future_timeline
        timeCircuit.sugars = new Array();

        // ------------- 1955 -------------
        // NOV051955---- (Saturday) Doc Brown slips off his toilet whilst hanging a clock and has a vision of the flux capacitor.

        timeCircuit.sugars.push({ values: "NOV0519550615", 
                                  amPm: clockSystem.AM,
                                  message: "(Saturday) Marty McFly arrives in 1955 from 1985, on Old Man Peabody's farm, and knocks down one of Old Man Peabody's twin pine trees."+ 
                                            "After fleeing from an angry Old Man Peabody, Marty drives over to Lyon Estates, only to discover it under construction."+ 
                                            "Immediately after, the DeLorean gets depleted of plutonium, rendering it useless for time travel."+ 
                                            "Marty then hides it behind the Lyon Estates signboard, then makes it to Hill Valley on foot.",
                                  audio: winAudio });

        timeCircuit.sugars.push({ values: "NOV0819550121", 
                                  amPm: clockSystem.AM,
                                  message: "(Tuesday) Marty, in a radiation suit as Darth Vader from the planet 'Vulcan', visits George to try and make him take Lorraine to the dance that Saturday.",
                                  audio: winAudio2 });

        timeCircuit.sugars.push({ values: "NOV1219550928", 
                                  amPm: clockSystem.PM,
                                  message: "(Saturday) Marvin asks if Marty would like to do one more number, and he plays 'Johnny B. Goode' (leading Marvin to phone his cousin Chuck)."+ 
                                            "Marty offers additional advice to his young parents in order to assure he will have a nice life back in '85.",
                                  audio: winAudio });

        timeCircuit.sugars.push({ values: "NOV1219551002", 
                                  amPm: clockSystem.PM,
                                  message: "(Saturday) Doc is probably hanging from the clock tower.",
                                  audio: winAudio2 });

        timeCircuit.sugars.push({ values: "NOV1219551004", 
                                  amPm: clockSystem.PM,
                                  message: "(Saturday) Lightning strikes the clock tower at precisely, damaging and stopping the seven-decade-old timepiece.",
                                  audio: winAudio3 });


        // ------------- 1985 -------------
        timeCircuit.sugars.push({ values: "OCT2619850120", 
                                  amPm: clockSystem.AM,
                                  message: "(Saturday) Einstein becomes the first time traveler in the world by departing one minute into the future.",
                                  audio: winAudio });

        timeCircuit.sugars.push({ values: "OCT2619850124", 
                                  amPm: clockSystem.AM,
                                  message: "(Saturday) Marty B arrives from 1955 in DeLorean B, crashing into the front of the Assembly of Christ church (formerly the Town Theater)."+ 
                                            "He then runs from the town square over to the Lone Pine Mall.",
                                  audio: winAudio });

        timeCircuit.sugars.push({ values: "OCT2619850133", 
                                  amPm: clockSystem.AM,
                                  message: "(Saturday) Doctor Emmett Lathrop 'Doc' Brown is shot dead by Libyan terrorists.",
                                  audio: winAudio });
        
        timeCircuit.sugars.push({ values: "OCT2619850135", 
                                  amPm: clockSystem.AM,
                                  message: "(Saturday) Marty flees from the Libyans in the DeLorean and accidentally departs 1985 for 1955 by accelerating to 88 mph.",
                                  audio: winAudio3 });

        timeCircuit.sugars.push({ values: "OCT2619851028", 
                                  amPm: clockSystem.AM,
                                  message: "(Saturday) Doc returns from 2015, sans Einstein, and crashes the DeLorean into the garbage cans in the McFlys' driveway."+ 
                                           "Doc then informs Marty that 'something has got to be done about (his) kids.' "+
                                           "Doc then proceeds to take Marty (and Jennifer by circumstance) forward along this new timeline to 2015.",
                                  audio: winAudio2 });
        


        // ------------- 2015 -------------
        timeCircuit.sugars.push({ values: "OCT2120150429", 
                                  amPm: clockSystem.PM,
                                  message: "(Wednesday) Doc, Marty and Jennifer arrive in 2015 to save Marty Jr. from Griff. Marty poses as Marty Jr. and turns down Griff's proposal. They arrived FLYING with delorean. When can we buy them? And most important thing, when can we buy a zapper gadget to render someone safely unconcious for an hour?",
                                  audio: winAudio });

        timeCircuit.sugars.push({ values: "OCT2120150431", 
                                  amPm: clockSystem.PM,
                                  message: "(Wednesday) Marty is probably wearing the new Nike Magic Air. This time Bob's matched.",
                                  audio: winAudio2 });

        timeCircuit.sugars.push({ values: "OCT2120150433", 
                                  amPm: clockSystem.PM,
                                  message: "(Wednesday) Marty is probably buying a Grays Sports Almanac with the intention of using it to his advantage once he returns to his own decade.. You, more than anybody else, also would you do.",
                                  audio: winAudio });
        
        timeCircuit.sugars.push({ values: "OCT2120150445", 
                                  amPm: clockSystem.PM,
                                  message: "(Wednesday) Marty is probably rolling over the river with an overboard. I need one..",
                                  audio: winAudio3 });

        timeCircuit.sugars.push({ values: "OCT2120150447", 
                                  amPm: clockSystem.PM,
                                  message: "(Wednesday) After the hoverboard chase which ensues, only Griff and his gang are arrested for damaging the courthouse.",
                                  audio: winAudio });        

        timeCircuit.sugars.push({ values: "OCT2120150700", 
                                  amPm: clockSystem.PM,
                                  message: "McFly family are probably enjoying the dinner with a Black and Decker rehydrator for pizza. I'm hungry, not you?",
                                  audio: winAudio });
        
        timeCircuit.sugars.push({ values: "OCT2120150715", 
                                  amPm: clockSystem.PM,
                                  message: "Old Biff is probably travelling to 1955. I'll be disappointed if you do not travel to that date.",
                                  audio: winAudio });

        timeCircuit.sugars.push({ values: "OCT2120150728", 
                                  amPm: clockSystem.PM,
                                  message: "Doc, Marty, Einstein and Jennifer depart 2015 for the 'alternate 1985'...",
                                  audio: winAudio });  

        

        // ------------- 1885 -------------
        // the third was not so good...
    },

    checkForSugars: function (panelTimeValues, panelTimeAmPm) {
        var isSugarTime = false;
        timeCircuit.sugars.forEach(function (element) {
            if (element.values === panelTimeValues && element.amPm === panelTimeAmPm){
                isSugarTime = true;
                timeCircuit.showSugarSign(element.message);
                element.audio.currentTime = 0;
                element.audio.play();
            }
        });

        if(!isSugarTime) {
            // TODO random message about irrelevant date, chicken...
            timeCircuit.showSugarSign("");
        }
    },

    showSugarSign: function (sugar) {
        var sugarSign = document.getElementById("sugar-sign");
        sugarSign.innerHTML = sugar;    
        if (sugarSign != "") { 
            sugarSign.className = "sugar-animate";
        } else {
            sugarSign.className = "hidden";
        }
    },

    sayHelloWorld: function () {
        heart.removeEventListener('click', timeCircuit.sayHelloWorld);
        var destinationTimeValues = timeCircuit.panelsTimeValues[panel.DESTINATION_TIME];
        var destinationTimeAmPm = timeCircuit.panelsTimeAmPm[panel.DESTINATION_TIME];
        var presetnTimeValues = timeCircuit.panelsTimeValues[panel.PRESENT_TIME];
        var presetnTimeAmPm = timeCircuit.panelsTimeAmPm[panel.PRESENT_TIME];
        var lastTimeDepartedValues = timeCircuit.panelsTimeValues[panel.LAST_TIME_DEPARTED];
        var lastTimeDepartedAmPm =  timeCircuit.panelsTimeAmPm[panel.LAST_TIME_DEPARTED];

        var introducedDestTimeValues = timeCircuit.introducedDestinationTimeValues;
        timeCircuit.introducedDestinationTimeValues = "";

        circuitSetAudio.currentTime = 0;
        circuitSetAudio.play();
        timeCircuit.setValuesToPanel("HELLO WORLD!!", clockSystem.NONE, panel.DESTINATION_TIME, 0);
        timeCircuit.setValuesToPanel("OCT2120150429", clockSystem.PM, panel.PRESENT_TIME, 0);
        timeCircuit.setValuesToPanel("YOU  ROCK  ;)", clockSystem.NONE, panel.LAST_TIME_DEPARTED, 0);
        
        setTimeout(function () {
            if (timeCircuit.isOn) {
                timeCircuit.setValuesToPanel(destinationTimeValues, destinationTimeAmPm, panel.DESTINATION_TIME, 0);
                timeCircuit.setValuesToPanel(presetnTimeValues, presetnTimeAmPm, panel.PRESENT_TIME, 0);
                timeCircuit.setValuesToPanel(lastTimeDepartedValues, lastTimeDepartedAmPm, panel.LAST_TIME_DEPARTED, 0);
                timeCircuit.introducedDestinationTimeValues = introducedDestTimeValues;      
                heart.addEventListener('click', timeCircuit.sayHelloWorld);
             }
        }, 3000);
    }

};

timeCircuit.init();

// browser and devices style exceptions
(function (){
    if (isAndroid) {
        var numbersArray = document.querySelectorAll('.number');
        for (var i = 0; i < numbersArray.length; i++) {
            numbersArray[i].className += ' android';
        }
        var digitArray = document.querySelectorAll('.digit');
        for (var i = 0; i < digitArray.length; i++) {
            digitArray[i].className += ' android';
        }
        var digitBgArray = document.querySelectorAll('.digit-bg');
        for (var i = 0; i < digitBgArray.length; i++) {
            digitBgArray[i].className += ' android';
        }
    }
}())

}(document, Timer, Speedometer));
