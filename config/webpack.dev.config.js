var webpack = require('webpack')
var path = require('path')


module.exports = {
	resolve : {
			//root : [path.resolve('./node_modules')],
			alias : [
				//{ vue   : path.join(__dirname,'node_modules/vue/dist/vue.js')},
				{ "d3"   : path.join(__dirname,"dist/d3.min.js") },
				{ "jquery" : "./public/jquery-2.2.4.min.js" }
					//{vue: 'vue/dist/vue.js'}
			],
			modulesDirectories : ["node_modules","dist"]
		 },
		 
		entry:    {
			//"graph" : "./client/graph.js",
			//"main" : "./app.js",
			"pages" : "./client/pages.js",
			"db"    : "./client/orient_databases.js"
		}
		/*[
		    //"./dist/d3-combined.js",
			//"./app.js"
			
			"./client/pages.js"
			,"./client/graph.js"
			,"./client/orient_databases.js"
			,"./node_modules/d3/d3.js",
			,"./public/jquery-2.2.4.min.js"
			
		]*/
		,output: { 
			path: path.join(__dirname,'build')
		  // ,path: '/static'
			,publicPath: 'http://localhost:3000/scripts/'
			,filename: '[name].js'
		}
		,plugins :[
 			  new webpack.ProvidePlugin({
					jquery : "jquery"
				}),
				
			new webpack.ProvidePlugin({
					vue : "vue/dist/vue.js"
				}),

		   new webpack.optimize.UglifyJsPlugin({
			  compress: {
				warnings: false
			  }
			})
		]
		,module: {
			// avoid webpack trying to shim process
			noParse: /es6-promise\.js$/,
			 preLoaders: [
				{ test: /\.json$/, exclude: /node_modules/, loader: 'json'},
			],
			loaders: [
			  {
				test: /\.vue$/,
				loader: 'vue'
			  },
			  {
				test: /\.js$/,
				// excluding some local linked packages.
				// for normal use cases only node_modules is needed.
				exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
				loader: 'babel',
				query : {
					presets : ['es2015']
					//,optional : ["runtime"]
				}
			  }
			]
		  }
		  
		 
    
}