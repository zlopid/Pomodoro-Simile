$(function(){ // TODO: Do I have to wrap it in this on-ready call?
	
	var Timer = Backbone.Model.extend({
		defaults: {
			minutes: 25,
			seconds: 0
		},

		start: function() {
			var doMore = _.bind(this.go, this);
			_.delay(doMore, 1000);
		},

		go: function() {
			if ((this.get("minutes") == 0) && (this.get("seconds") == 0)) {
				this.trigger("done");
				return;
			} else if (this.get("seconds") == 0) {
				this.set({minutes: this.get("minutes")-1, seconds: 59});
			} else {
				this.set({seconds: this.get("seconds")-1});
			}
			this.start();
		}
	});
	
	var TimerView = Backbone.View.extend({
		el: $("#counter"),
		
		initialize: function() {
			this.model = new Timer;
			this.render();
			this.model.bind('change', this.render, this);
			this.model.start();
		},
		
		render: function() {
			var minutes = this.model.get("minutes");
			var seconds = this.model.get("seconds");
			$(this.el).html(minutes + ":" + ((seconds < 10) ? "0" : "") + seconds);
		}
	});
	
	var Pomodoro = new TimerView();
});
