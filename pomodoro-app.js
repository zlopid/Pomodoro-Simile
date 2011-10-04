$(function() {
	/** 
	* Timers decrement from their initial minutes and seconds. They can be paused.
	*/
	var Timer = Backbone.Model.extend({
		defaults: {
			minutes: 0,
			seconds: 10,
			paused: true
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
				this.trigger("done");
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
	
	/**
	* Models the flow of a pomodoro session, with subsequent work and break countdowns.
	*/
	var PomodoroApp = Backbone.Model.extend({
		defaults: {
			workLength: {minutes: 0, seconds: 15},
			breakLength: {minutes: 0, seconds: 5},
			inBreak: false,
		},
		
		initialize: function() {
			this.timer = new Timer(this.get("workLength"))
			this.timer.bind('done', this.onTimerDone, this);
		},
		
		onTimerDone: function() {
			if (this.get("inBreak")) {
				this.timer.set(this.get("workLength"));
			} else {
				this.timer.set(this.get("breakLength"));
				this.timer.start();
			}	
			this.set({inBreak: !this.get("inBreak")});
		}
	});
	
	// Display the current time left on #counter
	var TimerCounterView = Backbone.View.extend({
		el: $('#counter'),
		
		events: {
			"click": "toggle"
		},
		
		initialize: function() {
			if (!this.model) 
				throw "Cannot make a view without a model!";
				
			this.render();
			this.model.bind('change', this.render, this);
		},
		
		render: function() {
			var minutes = this.model.get("minutes");
			var seconds = this.model.get("seconds");
			$(this.el).html(minutes + ":" + ((seconds < 10) ? "0" : "") + seconds);
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
	var TimerAlert = Backbone.View.extend({
		initialize: function() {
			if (!this.model) 
				throw "Cannot make a view without a model!";
				
			this.model.bind('done', this.done);
		},
		
		done: function() {
			alert("Time's up!");
		}
	});
	
	var PomodoroAppView = Backbone.View.extend({
		initialize: function() {
			this.model = new PomodoroApp();
			this.model.bind("change:inBreak", this.toggleBreak, this);
			this.counter = new TimerCounterView({model: this.model.timer});
			new TimerAlert({model: this.model.timer});
		},
		
		toggleBreak: function() {
			this.counter.toggleBreak();
		}
	});
	
	var Pomodoro = new PomodoroAppView();
});
