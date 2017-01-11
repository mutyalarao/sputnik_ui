//import webpackHotMiddleware from 'webpack-hot-middleware'; // This line  

var path = require('path')
, http = require('http')
,engines=require('consolidate');
var express = require ('express');
var webpack = require ('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require ('webpack-hot-middleware')

var config = require ('./config/webpack.dev.config')
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();
var router = require("./libs/route_handler.js");
var viewHandler = require("./libs/view_handler.js");
var session = require('express-session');
var uuid = require('uuid');

//var jwt = require('jsonwebtoken');
//var expressJwt = require('express-jwt');

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());  
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
	//genid : function(req){return uuid.v4();}
    secret : 'Rahasyam'
	,resave: false
	,saveUninitialized: true
	,cookie : { secure : true}
}
))

viewHandler.setViewEngine(app,'html');

app.use(function(req,res,next){
	
	var db = req.params.db;
	console.log('db name' + req.params.db)
	
	next();
})

app.use(router);
//app.use(expressJwt({secret : 'secret'}).unless({path:['/login','/scripts/bundle.js','/__webpack_hmr']}));


// Populates req.session
/* app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'keyboard cat'
}));
 */
// **** Webpack config
config.plugins.push(new webpack.HotModuleReplacementPlugin());
var compiler = webpack(config)
app.use(webpackHotMiddleware(compiler)); // And this line
app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: {colors: true}
}))
// ****>




app.listen(3000, () => console.log ('listening on 3000'))