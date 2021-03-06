import Vue from 'vue/dist/vue.js'

new Vue({

  // We want to target the div with an id of 'events'
  el: '#pages',

  // Here we can register any values or collections that hold data
  // for the application
	 data: {
	  page: { name: 'Home', description: '', url: '/home' },
	  pages: []
	},

	 // Anything within the ready function will run when the application loads
	ready: function() {
	  // When the application loads, we want to call the method that initializes
	  // some data
	  this.pages.push(this.page);
	},


  // Methods we want to use in our application are registered here
  methods: {
		   // We dedicate a method to retrieving and setting some data
	  
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
