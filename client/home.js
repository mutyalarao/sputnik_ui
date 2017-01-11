import Vue from 'vue'

new Vue({

  // We want to target the div with an id of 'events'
  el: '#events',

  // Here we can register any values or collections that hold data
  // for the application
	 data: {
	  event: { name: '', description: '', date: '' },
	  events: []
	  //resultsLoaded : ""
	},

	 // Anything within the ready function will run when the application loads
	mounted: function() {
	  // When the application loads, we want to call the method that initializes
	  // some data
	  
	  this.$nextTick(function(){
		this.fetchEvents();
	  });
	  

	},


  // Methods we want to use in our application are registered here
  methods: {
		   // We dedicate a method to retrieving and setting some data
	  fetchEvents: function() {
		var events = [
		  {
			id: 1,
			name: 'TIssFF',
			description: 'Toronto International Film Festival',
			date: '2015-09-10'
		  },
		  {
			id: 2,
			name: 'The Martian Premiere',
			description: 'The Martian comes to theatres.',
			date: '2015-10-02'
		  },
		  {
			id: 3,
			name: 'SXSW',
			description: 'Music, film and interactive festival in Austin, TX.',
			date: '2016-03-11'
		  }
		];
		// $set is a convenience method provided by Vue that is similar to pushing
		// data onto an array
		this.$set('events', events);
	  },

	  // Adds an event to the existing events array
	  addEvent: function() {
		if(this.event.name) {
		  alert("Event Added")
		  this.events.push(this.event);
		  this.event = { name: '', description: '', date: '' };
		  
		}
	  }
	  
  }
});

/* var myModel = {name:"Test", age:24}

var myViewModel = new Vue({
	el : "#myView",
	model : myModel
	
}); */
/* import Router from 'vue-router'
import { domain, fromNow } from './filters'
import App from './components/App.vue'
import NewsView from './components/NewsView.vue'
import ItemView from './components/ItemView.vue'
import UserView from './components/UserView.vue'
 */
/* // install router
Vue.use(Router)

// register filters globally
Vue.filter('fromNow', fromNow)
Vue.filter('domain', domain)

// routing
var router = new Router()

router.map({
  '/news/:page': {
    component: NewsView
  },
  '/user/:id': {
    component: UserView
  },
  '/item/:id': {
    component: ItemView
  }
})

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/news/1'
})

router.start(App, '#app') */
