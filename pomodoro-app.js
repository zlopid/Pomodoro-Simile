$(function() {
	/** 
	* A Pomodoro is one work period with one break period.
	* This counts down the work period, and fires "done:work"
	* Then immediately counts down the break period, and fires "done:break"
	*
	* It can be paused, or reset.
	*/
	var Pomodoro = Backbone.Model.extend({
		defaults: {
			minutes: 25,
			seconds: 0,
			workLength: {minutes: 25, seconds: 0},
			breakLength: {minutes: 5, seconds: 0},
			inBreak: false,
			paused: true
		},

		reset: function() {
			this.set(this.get("workLength"));
			this.set({paused: true, inBreak: false});
		},

		start: function() {
			this.set({paused: false});
			var doAgain = _.bind(this.tick, this);
			_.delay(doAgain, 1000);
		},
		
		pause: function() {
			this.set({paused: true});
		},

		tick: function() {
			if (this.get("paused"))
				return;
			
			this.decrementTime();
			
			if ((this.get("minutes") == 0) && (this.get("seconds") == 0)) {
				if (this.get("inBreak")) {
					this.reset();
					this.trigger("done:break");
				} else {	
					this.set(this.get("breakLength"));
					this.trigger("done:work");
					this.set({inBreak: true});
					this.start();
				}
			} else {
				this.start();
			}
		},
		
		decrementTime: function() {
			if (this.get("seconds") == 0) {
				this.set({minutes: this.get("minutes")-1, seconds: 59});
			} else {
				this.set({seconds: this.get("seconds")-1});
			}
		}
	});
	
	// Display the current time left in #counter
	var PomodoroCounterView = Backbone.View.extend({
		el: $('#counter'),
		
		template: _.template($("#counter-template").html()),
		
		events: {
			"click": "toggle"
		},
		
		initialize: function() {
			if (!this.model) 
				throw "Cannot make a view without a model!";
				
			this.render();
			this.model.bind('change', this.render, this);
			this.model.bind('change:inBreak', this.toggleBreak, this);
		},
		
		render: function() {
			var minutes = this.model.get("minutes");
			var seconds = this.model.get("seconds");
			
			$(this.el).html(this.template({
				formattedTime: minutes + ":" + ((seconds < 10) ? "0" : "") + seconds,
				clickAction: (this.model.get("paused") ? "resume" : "pause")
			}))
			return this;
		},
		
		toggle: function() {
			if (this.model.get("paused")) {
				this.model.start();
			} else {
				this.model.pause();
			}
		},
		
		toggleBreak: function() {
			$(this.el).toggleClass("break");
		}
	});
	
	// Alert when any timer is done
	var PomodoroAlert = Backbone.View.extend({
		initialize: function() {
			if (!this.model) 
				throw "Cannot make a view without a model!";
				
			this.model.bind('done:break', this.doneBreak, this);	
			this.model.bind('done:work', this.doneWork, this);
		},
		
		doneBreak: function() {
			alert("Break is done! Hit the timer when you're ready for another");
		},

		doneWork: function() {
			alert("Time for a break!");
		}
	});
	
	var PomodoroApp = Backbone.View.extend({
		initialize: function() {
			this.model = new Pomodoro();
			new PomodoroCounterView({model: this.model});
			new PomodoroAlert({model: this.model});
		}
	});
	
	
	pomo = new PomodoroApp();
});

/**
* Call UseTestSettings(this.pomo)
* to set the Pomodoro to a short duration for testing
*/
function UseTestSettings(pomo) {
	pomo.model.set({workLength: {minutes: 0, seconds: 5}, breakLength: {minutes: 0, seconds: 3}});
	pomo.model.reset();
}
