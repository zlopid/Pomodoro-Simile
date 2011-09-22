$(function(){
	
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
			
			// Notify when done
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
	
	var TimerView = Backbone.View.extend({
		el: $("#counter"),
		
		events: {
			"click": "toggle"
		},
		
		initialize: function() {
			this.model = new Timer;
			this.render();
			this.model.bind('change', this.render, this);
			
			new TimerAlert({model: this.model});
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
		}
	});
	
	// TimerAlert requires that you pass in the model
	var TimerAlert = Backbone.View.extend({
		initialize: function() {
			this.model.bind('done', this.done);
		},
		
		done: function() {
			alert("Time's up!");
		}
	})
	
	var Pomodoro = new TimerView();
});
