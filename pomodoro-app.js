$(function(){
	
	var Timer = Backbone.Model.extend({
		defaults: {
			minutes: 0,
			seconds: 5
		},

		start: function() {
			var doAgain = _.bind(this.tick, this);
			_.delay(doAgain, 1000);
		},

		tick: function() {
			// Update the time
			if (this.get("seconds") == 0) {
				this.set({minutes: this.get("minutes")-1, seconds: 59});
			} else {
				this.set({seconds: this.get("seconds")-1});
			}
			
			// Notify when done
			if ((this.get("minutes") == 0) && (this.get("seconds") == 0)) {
				this.trigger("done");
				return;
			} else {
				this.start();
			}
		}
	});
	
	var TimerView = Backbone.View.extend({
		el: $("#counter"),
		
		initialize: function() {
			this.model = new Timer;
			this.render();
			this.model.bind('change', this.render, this);
			this.model.start();
			
			new TimerAlert({model: this.model});
		},
		
		render: function() {
			var minutes = this.model.get("minutes");
			var seconds = this.model.get("seconds");
			$(this.el).html(minutes + ":" + ((seconds < 10) ? "0" : "") + seconds);
		},
		
		done: function() {
			alert("Time's up!");
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
