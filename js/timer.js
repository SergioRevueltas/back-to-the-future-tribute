var clockSystem = {
    NONE: -1,
    AM: 0,
    PM: 1,
};

var Timer = (function() {
	'use strict';

	var timer = {
		// model
		date : 	"",		
		timeDiff: 0,

		// private
		newPresent: "",
		yearOverflow: false,
		amPm : clockSystem.AM,
		handler : 0,
		months : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DIC'],
		now : new Date(),
		offset : new Date().getTimezoneOffset(),
		minuteChangeEvent: null,

		init: function () {
			this.minuteChangeEvent = document.createEvent('Event');
			this.minuteChangeEvent.initEvent('minuteChange', true, true);
			this.updateDate();
			return this;
		},

		getDate: function () {
			return this.date;
		},

		getAmPm: function () {
			return this.amPm;
		},

		start: function () {
	        timer.updateDate();
	        timer.handler = setTimeout(timer.start, 1000);
	    },

	    updateDate: function () {
		    timer.now = new Date();
			var month = this.months[this.now.getMonth()];
		    var day = timer.formatTwoDigits(timer.now.getUTCDate());
		    var year = timer.now.getFullYear();
 			var hours = timer.now.getHours();
 			// hour
			timer.amPm = clockSystem.AM;
            hours = timer.now.getHours();
    		if (hours > 11) { 
		    	hours = hours % 12;
			    timer.amPm =clockSystem.PM;		    	
		    }
		    if (hours == 0) {
		    	hours = 12;
		    }
		    hours = timer.formatTwoDigits(hours);
			var min = timer.formatTwoDigits(timer.now.getMinutes());

			timer.now.setTime(timer.now.getTime() - timer.now.getTimezoneOffset() * 60 * 1000);            
			// minutes
			min = timer.formatTwoDigits(timer.now.getMinutes());
			// days
			day = timer.formatTwoDigits(timer.now.getUTCDate());

		    if (timer.timeDiff != 0) {
		    	// show time diff
		    	//console.log("timeDiff: " + timer.timeDiff / (1000 * 60 * 60));
				//console.log("now: " + timer.now);
				
				// time zone offset
				//timer.now.setTime(timer.now.getTime() - timer.now.getTimezoneOffset() * 60 * 1000);
				//console.log("now2: (-offset time zone)" + timer.now);

		    	// time diference with real present
				timer.now = new Date();
		    	timer.now.setTime(timer.now.getTime() + timer.timeDiff);
				// day
				day = timer.formatTwoDigits(timer.now.getUTCDate());
				// hour
				timer.amPm = clockSystem.AM;
	            hours = timer.now.getHours();
	    		if (hours > 11) { 
			    	hours = hours % 12;
				    timer.amPm =clockSystem.PM;		    	
			    }
			    if (hours == 0) {
		    		hours = 12;
		    	}
			    hours = timer.formatTwoDigits(hours);
			    // month
			    month = this.months[this.now.getMonth()];
			    // year
			    if (timer.yearOverflow) {
		    		year -= 1900; 
		    	} else {
		    		year = timer.now.getFullYear();
		    	}
	            year = timer.formatYear(year);
		    	//console.log("year motnh hours: (+timeDiff)" + timer.now + "   DAY: " + day + "  HOURS: "+ hours);

				// quit new present time offset
				timer.now.setTime(timer.now.getTime() - timer.now.getTimezoneOffset() * 60 * 1000);            
				// minutes
				min = timer.formatTwoDigits(timer.now.getMinutes());
				// days
				day = timer.formatTwoDigits(timer.now.getUTCDate());

			    //hours = timer.formatTwoDigits(hours);
	
		    	//console.log("min day: (-offset)" + timer.now + "   DAY: " + day + "  HOURS: "+ hours);

		    }

			var newDate = "" + month + day + year + hours + min;
			if (newDate != timer.date) {
				timer.date = newDate;
				document.dispatchEvent(timer.minuteChangeEvent); //Notify to controller that minute changed
			}
		},

		/*
			Change timeDiff value, which represent time difference between destionation time and present.	
		*/
		newTimeTravel: function (destinationTimeValues, destinationTimeAmPm) {
			timer.stop();
			
			var newPresentDate = timer.getDateFromTimePanelValues(destinationTimeValues, destinationTimeAmPm);        	
			timer.now = new Date();

			// calculate time difference between 'real present' and 'new present' times
			timer.timeDiff = newPresentDate.getTime() - timer.now.getTime();

			timer.start();
		},

		/*
			Return Date object.
		*/
		getDateFromTimePanelValues: function (timePanelValues, amPm) {			
			// get Date from destionationTimeValues
			var month = Number(timer.months.indexOf(timePanelValues.substring(0, 3)));
	        var day = Number(timePanelValues.substring(3, 5));
	        var year = Number(timePanelValues.substring(5, 9));
	        if (year < 100) {
	        	timer.yearOverflow = true;
                year += 1900; 
            }
            year = timer.formatYear(year);
	        var hour = Number(timePanelValues.substring(9, 11));
	        if (amPm == clockSystem.PM) { 
		    	hour += 12;
		    }
		    if(hour == 24) {
		    	hour = 12;
		    }
           	var min = Number(timePanelValues.substring(11, 13)); 
           	var second = 0;
        	
        	// new present Date
        	var panelDate = new Date(Date.UTC(year, month, day, hour, min, second));
			// add timezone offset
			panelDate.setTime(panelDate.getTime() + panelDate.getTimezoneOffset() * 60 * 1000);

			return panelDate;
		},

	    stop: function () {
	        if (this.handler) {
	            clearTimeout(this.handler);
	            this.handler = 0;
	        }
	        timer.date = "";
	    },

	    formatTwoDigits: function (num) {
		    if (num < 10) {
		        num = "0" + num;
		    }
		    return num;
		},

		formatYear: function (num) {
			var numString = "0000" + num;
		    return numString.substring(numString.length - 4, numString.length);
		}


	};

	return timer;

}());