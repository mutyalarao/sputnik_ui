var express = require('express');
var session = require('express-session');
var router = express.Router();
var _request = require('request');
var OEngine = require('./db_handler.js');

var oEngine = new OEngine();

 oEngine.setConn({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'root'
}); 


oEngine.connectServer();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
	console.log(req.session);
  res.render('home');
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/listDatabases',function(req,res){
	_request.get('http://localhost:2480/listDatabases',(error,response,body)=>{
		console.log("typeof body " + typeof(body));
		res.send(body);
	})

})
router.get('/disconnect',function(req,res){
	_request.get("http://localhost:2480/disconnect",(error,response,body)=>{
		if(error) res.send(error);
		res.send(body)
	})
	
});

router.post("/connect/:db",function(req,res){
	
 	var dbName = req.params.db;
	var superClass = req.body.superClass
	console.log("superCLass:  " +req.body.superClass)
	oEngine.openDB(dbName,'root','root'); 
	oEngine.getClassListPr(dbName)
	.then(vals => {
		//console.log(vals);
		var classArr = [];
		vals.forEach((e,i,a) => {
			if(superClass == "" || e.superClass == superClass)
			  classArr.push(e.name);			
		});
		console.log("classArr=",classArr)
		res.send({
				classList : classArr
			});
	})
	.catch(e => {
		var _e = e;
		res.status(500).send({error : _e})
	})
	
	//dbEngine.
	//res.send(200)
})


router.get('/getClassProps/:db/:class',(req,res)=>{
	
	var dbName = req.params.db;
	var className = req.params.class;
	//var sql = req.body.sql;
	//console.log(sql);
	oEngine.getClassPropsPr(dbName, className)
	.then(val => {		
	   console.log('successfully got class props',val);
	   //var data = JSON.stringify(val);
		res.send({classProps: val});
	})
	.catch(e =>{
		var _e = e;
		console.log('exception',_e)
		res.status(404).send({error : _e});
	})
	
})



router.get('/getByRid/:db/:rid',(req,res) => {
	var dbName = req.params.db;
	var rid = '#' + req.params.rid.replace('_',':');
	
	
	oEngine.getByRid_Pr(dbName,rid)
	.then(val => {
		res.status(200).send(val)
	})
	.catch(e => {
		res.status(500).send(e)
	})
	
})

router.post('/getVertexMap/:db/:class', (req,res) => {
	var dbName = req.params.db;
	var className = req.params.class;
	var classCriteria = req.body.classCriteria;
	var depth = 5, limit=500;
	var strategy = 'BREADTH_FIRST';
	var whereStr = "", whereArr = [],whereArr2=[], whereStr2="";
	var params = {params:{}};
	
	console.log('Class criteria...');
	console.log(classCriteria);
	
	if(req.body.depth){
		depth = req.body.depth
	}
	if(req.body.strategy){
		strategy = req.body.strategy;
	}	
	if(req.body.rowLimit){
		limit = req.body.rowLimit;
	}
	    
	classCriteria.forEach((e,i,a) => {
		//if(whereStr == "") whereStr = ' where ';
		//!!!Need to add support for numeric types. Should not have quotes!!!!
		whereArr.push(` ${e.prop} = :${e.prop} `);
		if(typeof(e.value) == 'number' )
			whereArr2.push(` ${e.prop} = ${e.value} `)
		else
			whereArr2.push(` ${e.prop} = '${e.value}' `)
		//whereStr += ` ${e.prop} = :${e.prop}`
		params.params[e.prop] = e.value;
	});
	
	if(whereArr.length > 0) 
	{
		whereStr = ' WHERE ';
		whereStr += whereArr.join(' AND ');
	}
	
	if(whereArr2.length > 0) 
	{
		whereStr2 = ' WHERE ';
		whereStr2 += whereArr2.join(' AND ');
	}
//	if(whereArr.length > 1)
	 
	console.log(whereStr);
	
	var sql = `select * from ( TRAVERSE bothE(), bothV() from (SELECT * FROM ${className.toLowerCase()} ${whereStr}) while $depth <= ${depth}  strategy ${strategy} ) `;
	//LIMIT ${limit}`;
	//console.log(sql);
	//console.log(params);
	
	//var auth = "Basic "+ bota("root:root");
	var httpsql = `select * from ( TRAVERSE bothE(), bothV() from (SELECT * FROM ${className.toLowerCase()} ${whereStr2}) while $depth <= ${depth}  strategy ${strategy} ) LIMIT ${limit}`;
	
	console.log(httpsql);
	
	_request.get(`http://localhost:2480/command/${dbName}/sql/${httpsql}`,{ 
		auth:{'user': 'root', 'pass' : 'root', 'sendImmediately' : true }
	},
	(error,response,body) => {
		console.log('body..')
		 console.log(body);
		 console.log(error)
		 if(typeof(body)!= 'object') 
			 body = JSON.parse(body)
		 res.status(200).send(body);
	});
	
/* 	oEngine.execQueryPr(dbName,sql,params,limit)
	.then(val=>{
		//val.results[].content[0].value.
		
		console.log("Success")
		console.log(val);
		console.log(val.results[0].content[0])
		console.log(val.results[0].content[0].value)
		console.log(val.results[0].content[0].value.out_record_fields[0])
		console.log(val.results[0].content[0].value.out_subrecords[0])
		res.status(200).send({data : val});
	})
	.catch(ex => {
		console.log("exception...")
		console.log(ex)
		res.status(500).send({data:ex});
	})
 */	
	
})

module.exports = router;




