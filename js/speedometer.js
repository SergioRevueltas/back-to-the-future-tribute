var deloreanAcceleration = document.getElementById("delorean-acceleration");
var deloreanDeceleration = document.getElementById("delorean-deceleration");
var deloreanStartup = document.getElementById("delorean-startup");
var deloreanTurnOff = document.getElementById("delorean-turn-off");
var deloreanIdleA = document.getElementById("delorean-idle-a");
var deloreanIdleB = document.getElementById("delorean-idle-b");
var deloreanMaxSpeedA = document.getElementById("delorean-max-speed-a");
var deloreanMaxSpeedB = document.getElementById("delorean-max-speed-b");

var speedometerStatus = {
	OFF: -1,
	IDLE: 0,
	ACCELERATING: 1,
	DECELERATING: 2,
	MAX_SPEED: 3,
	STOPPING: 4,
	REACHING_MAX: 5
};

var Speedometer = (function() {
	'use strict';

	var speedometer = {
		/*

		 /$$        /$$$$$$   /$$$$$$  /$$$$$$$$
		| $$       /$$__  $$ /$$__  $$|__  $$__/
		| $$      | $$  \ $$| $$  \__/   | $$   
		| $$      | $$  | $$|  $$$$$$    | $$   
		| $$      | $$  | $$ \____  $$   | $$   
		| $$      | $$  | $$ /$$  \ $$   | $$   
		| $$$$$$$$|  $$$$$$/|  $$$$$$/   | $$   
		|________/ \______/  \______/    |__/   

		velocityKeys: 	[0, 4, 8, 15, 16, 23, 42, 
						55, 69, 80, 83, 84, 85, 86, 87, 88],
		*/
		// velovity: delay --> total: 16600
		accelerationDelay : {
			0: 600,
			4: 600, 
			8: 950, 
			15: 900, 
			16: 850, 
			23: 800,
			42: 750, 
			55: 700, 
			69: 650, 
			80: 600, 
			83: 700, 
			84: 800, 
			85: 1000, 
			86: 1300, 
			87: 1600, 
			88: 1900
		},

		decelerationDelay : {
			0: 500,
			4: 1000,
			8: 900,
			15: 700,
			16: 900,
			23: 1200,
			42: 1200,
			55: 1200,
			69: 1200,
			80: 1300,
			83: 900,
			84: 900,
			85: 900,
			86: 900,
			87: 800,
			88: 600
		},

		isOn: false,
		velocityKeys : null, 
		velocityIndex: 0,
		status: speedometerStatus.OFF,
		handler: 0,
		idleCurrentPlayer: "A",
		maxSpeedCurrentPlayer: "A",
		isPlayingIdle: false,
		isPlayingMaxSpeed: false,
		maxSpeedEvent : null,

		init: function () {
			this.isOn = false;
			this.velocityKeys = Object.keys(speedometer.accelerationDelay);

			this.maxSpeedEvent = document.createEvent('Event');
			this.maxSpeedEvent.initEvent('reachEightyEightMPH', true, true);

			deloreanAcceleration.volume = 0.2;
	        deloreanDeceleration.volume = 0.2;
	        deloreanStartup.volume = 0.2;
   	        deloreanTurnOff.volume = 0.2;
	        deloreanIdleA.volume = 0.1;
	        deloreanIdleB.volume = 0.1;
	        deloreanMaxSpeedA.volume = 0.2;
	        deloreanMaxSpeedB.volume = 0.2;

			return this;
		},

		toogleOnOff: function (){
	        this.isOn = !this.isOn;
	    	if (this.isOn){
	            this.start();
	        } else {
	            this.turnOff();
		    }
		    return this.isOn;
    	},

    	isOn: function () {
        	return this.isOn;
    	},

		start: function () {
			this.setValuesToSpeedometer('00');
			deloreanStartup.play();
			setTimeout(function () {
				speedometer.status = speedometerStatus.IDLE;
				speedometer.playIdleLoop();	
			}, 1000);
	    },

	    getAccelerationTotalTime: function () {
	    	var totalTime = 0;
	    	for (var i = 0; i < speedometer.velocityKeys.length; i++) {
	    		totalTime += speedometer.accelerationDelay[speedometer.velocityKeys[i]];
	    	}
	    	return totalTime;
	    },

	    getAccelerationElapsedTime: function () {
	    	var elapsedTime = 0;
	    	for (var i = 0; i <= speedometer.velocityIndex; i++) {
	    		elapsedTime += speedometer.accelerationDelay[speedometer.velocityKeys[i]];
	    	}
	    	return elapsedTime;
	    },

	    getDecelerationTotalTime: function () {
	    	var totalTime = 0;
	    	for (var i = 0; i < speedometer.velocityKeys.length; i++) {
	    		totalTime += speedometer.decelerationDelay[speedometer.velocityKeys[i]];
	    	}
	    	return totalTime;
	    },

	    getDecelerationElapsedTime: function () {
	    	var elapsedTime = 0;
	    	for (var i = (speedometer.velocityKeys.length - 1); i > speedometer.velocityIndex; i--) {
	    		elapsedTime += speedometer.decelerationDelay[speedometer.velocityKeys[i]];
	    	}
	    	return elapsedTime;
	    },

		startAcceleration: function () {
			speedometer.stop();
			speedometer.status = speedometerStatus.ACCELERATING;
			speedometer.update(speedometer.status);
			var percentage = speedometer.getAccelerationElapsedTime() / speedometer.getAccelerationTotalTime();
			deloreanAcceleration.currentTime = percentage * deloreanAcceleration.duration;
            deloreanAcceleration.play();
            deloreanDeceleration.pause();

		},

		startDeceleration: function () {
			speedometer.stop();
			speedometer.status = speedometerStatus.DECELERATING;
			speedometer.update(speedometer.status);
			var percentage = speedometer.getDecelerationElapsedTime() / speedometer.getDecelerationTotalTime();
			deloreanDeceleration.currentTime = percentage * deloreanDeceleration.duration;
            deloreanDeceleration.play();
            deloreanAcceleration.pause();

		},

		notifyMaxSpeed: function () {
			speedometer.status = speedometerStatus.MAX_SPEED;
			if (!speedometer.isPlayingMaxSpeed) {
				speedometer.playMaxSpeedLoop();
			}
			document.dispatchEvent(speedometer.maxSpeedEvent); //Notify that reach 88mph
		},

		update: function (status) {
        	if (speedometer.velocityIndex >= speedometer.velocityKeys.length || speedometer.velocityIndex < 0){
	        	return;
	        }
	        var currentDelay = 0;
	        switch(status) {
		        case speedometerStatus.OFF:
		            return;

		        case speedometerStatus.IDLE:
		            return;

		        case speedometerStatus.ACCELERATING:
			        if ((speedometer.velocityIndex + 1) < speedometer.velocityKeys.length){
						speedometer.velocityIndex += 1;
						if ((speedometer.velocityIndex + 2) == speedometer.velocityKeys.length - 1) {
							speedometer.status = speedometerStatus.REACHING_MAX;
							if (!speedometer.isPlayingMaxSpeed) {
								speedometer.playMaxSpeedLoop();
							}
						}
		            } else {
						speedometer.notifyMaxSpeed();
						return;
		            }
		            // get current delay
					currentDelay = speedometer.accelerationDelay[speedometer.velocityKeys[speedometer.velocityIndex]];
					break;

				case speedometerStatus.REACHING_MAX:
		            if ((speedometer.velocityIndex + 1) < speedometer.velocityKeys.length){
						speedometer.velocityIndex += 1;
		            } else {
		                speedometer.notifyMaxSpeed();
		                return;
		            }
		            // get current delay
					currentDelay = speedometer.accelerationDelay[speedometer.velocityKeys[speedometer.velocityIndex]];
		            break;

		        case speedometerStatus.MAX_SPEED:
		            return;

		        case speedometerStatus.DECELERATING:
		            if ((speedometer.velocityIndex - 1) >= 0){
						speedometer.velocityIndex = speedometer.velocityIndex - 1;
						if ((speedometer.velocityIndex - 2) == 0) {
							speedometer.status = speedometerStatus.STOPPING;
							if (!speedometer.isPlayingIdle) {
								speedometer.playIdleLoop();
							}
						}
		            } else {
		                speedometer.status = speedometerStatus.IDLE;
		                if (!speedometer.isPlayingIdle) {
							speedometer.playIdleLoop();
						}
		                return;
		            }
					// get current delay
					currentDelay = speedometer.decelerationDelay[speedometer.velocityKeys[speedometer.velocityIndex]];
		            break;

		        case speedometerStatus.STOPPING:
		            if ((speedometer.velocityIndex - 1) >= 0){
						speedometer.velocityIndex = speedometer.velocityIndex - 1;
		            } else {
		                speedometer.status = speedometerStatus.IDLE;
		                if (!speedometer.isPlayingIdle) {
							speedometer.playIdleLoop();
						}
		                return;
		            }
					// get current delay
					currentDelay = speedometer.decelerationDelay[speedometer.velocityKeys[speedometer.velocityIndex]];
		            break;

		        default:
		            return;
        	}

            //display current velocity
            var currentVelocity = speedometer.velocityKeys[speedometer.velocityIndex];
	        speedometer.setValuesToSpeedometer(currentVelocity + "");

			//recursive call
		    speedometer.handler = setTimeout(function () {
		                speedometer.update(speedometer.status);
		            },currentDelay);
		    
	    },

	    playIdleLoop: function () {
	    	speedometer.isPlayingIdle = true;
		    if (speedometer.status == speedometerStatus.IDLE || speedometer.status == speedometerStatus.STOPPING) {
			    if(speedometer.idleCurrentPlayer == "A"){
					deloreanIdleB.currentTime = 0;
			        deloreanIdleB.play();
			        speedometer.idleCurrentPlayer = "B";
			    }
			    else{	
					deloreanIdleA.currentTime = 0;
			        deloreanIdleA.play();
			        speedometer.idleCurrentPlayer = "A";
			    }
			    speedometer.handler = setTimeout(function () {
			    	speedometer.playIdleLoop();
			    }, 1700); // idle audio length is 1800 ms
			} else {
				speedometer.isPlayingIdle = false;
			}
	    },

		playMaxSpeedLoop: function () {
			speedometer.isPlayingMaxSpeed = true;
		    if (speedometer.status == speedometerStatus.MAX_SPEED || speedometer.status == speedometerStatus.REACHING_MAX) {
			    if(speedometer.maxSpeedCurrentPlayer == "A"){
					deloreanMaxSpeedB.currentTime = 0;
			        deloreanMaxSpeedB.play();
			        speedometer.maxSpeedCurrentPlayer = "B";
			    }
			    else{	
					deloreanMaxSpeedA.currentTime = 0;
			        deloreanMaxSpeedA.play();
			        speedometer.maxSpeedCurrentPlayer = "A";
			    }
			    speedometer.handler = setTimeout(function () {
			    	speedometer.playMaxSpeedLoop();
			    }, 1960); // max speed audio length is 2060 ms
			} else {
				speedometer.isPlayingMaxSpeed = false;
			}
	    },

	    setValuesToSpeedometer: function(values) {
	        var firstDigit, secondDigit, firstDigitClass, secondDigitClass, dotClass;
	        if(values.length === 1) {
	            firstDigit = "0"; // shit
	            secondDigit = values[0];
	            firstDigitClass = 'digit-value digit-hidden';
	        	secondDigitClass = 'digit-value digit-visible';
	            dotClass = 'digit-dot on';
	        } else if(values.length === 2) {
	            firstDigit = values[0];
	            secondDigit = values[1];
	            firstDigitClass = 'digit-value digit-visible';
	        	secondDigitClass = 'digit-value digit-visible';
	            dotClass = 'digit-dot on';
	        } else {
	            firstDigit = "8";	// shit
	            secondDigit = "8";	// shit
	            firstDigitClass = 'digit-value digit-hidden';
	        	secondDigitClass = 'digit-value digit-hidden';
	            dotClass = 'digit-dot';
	        }
	        document.querySelector('#ten .digit-value').innerHTML = firstDigit;
	        document.querySelector('#unit .digit-value').innerHTML = secondDigit;
			document.querySelector('#ten .digit-value').className = firstDigitClass;
	        document.querySelector('#unit .digit-value').className = secondDigitClass;        
	        document.querySelector('#unit .digit-dot').className = dotClass;
	    },

	    stop: function () {
	        if (speedometer.handler) {
	            clearTimeout(speedometer.handler);
	            speedometer.handler = 0;
	        }
			speedometer.isPlayingIdle = false;
			speedometer.isPlayingMaxSpeed = false;
	    },

	    stopAudio: function () {
	    	deloreanAcceleration.pause();
		    deloreanDeceleration.pause();
			deloreanStartup.pause();
			//deloreanTurnOff.pause(); // must play
			deloreanIdleA.pause();
			deloreanIdleB.pause();
			deloreanMaxSpeedA.pause();
			deloreanMaxSpeedB.pause();
	    },

	    turnOff: function () {
	    	speedometer.stop();
	    	deloreanTurnOff.play();
	    	speedometer.setValuesToSpeedometer('');
			speedometer.velocityIndex = 0;
            speedometer.status = speedometerStatus.OFF;
            setTimeout(function () {
            	speedometer.stopAudio();
            }, 1000);
	    }

	};

	return speedometer;

}());