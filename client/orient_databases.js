//import Vue from 'vue'
import Vue from 'vue/dist/vue.js'
//import  d3 from 'd31'
var d3 = require('d3');
import $ from 'jquery'
import Graph from './graph.js'
//import XForm from './utils.js'
//import AttrWrapper from './utils.js'
//var Graph = require('vue');
var XForm = require('./utils.js').XForm;
var AttrWrapper = require('./utils.js').AttrWrapper;

function quotify(value){
	if(typeof(val) == "number") return value
	else return "'" + value + "'";
}
function showLoading(flag){
		var loadingEl = d3.select("#loadingPane");
		console.log(loadingEl)
	if(flag){
		//loadingEl.style( {"z-index": "4" , visibility:  'true'});
		//loadingEl.attr("style", "z-index : 4; visibility:true");
		//loadingEl.classed("showLoadingScreen");
		$('#loadingPane').css({"display" : "block",
		              "z-index" : '4'});
		//$('#loadingPane').css('visibility',"true");
	}		
	else{
		//loadingEl.style( {"z-index": "-4" , "visibility":  'false'});
		//loadingEl.style( "z-index : -4, visibility:false");
		//loadingEl.classed("loadingScreen");
				$('#loadingPane').css({"z-index" : '-4', 
								"display" : 'none'});
	}
		
	
}
Vue.use(require('vue-resource'));

// define
/* var propSelector = Vue.extend({
  template: "<div v-for='prop in classProps'> \
  {{prop.name}} \
  </div>"
})

// register
Vue.component('prop-selector', propSelector)

// create a root instance
new Vue({
  el: '#prop_selector',
  data:{
	 //resultsLoaded : false	  
  }
}) */

 var infoPane = new Vue({
	el : '#info_pane',
	data : {
		infoPaneText : '',
		resultsLoaded : false
	},
	mounted : function(){
		//this.$set('vertexArr', ['aaaa','sdfsfd','werwer','fghfgh'])
		
	}
}); 

var svgRenderer = new Vue({
	
  el : '#svg_area',
  data : {
	 svg : {}, 
	 cx : 10,
     cy:10,
     margin : {left:10,right:10,top:10,bottom:10},
	 width : 1200,
	 height : 800,
	 nodes : {},
	 links : [],
	 rootRid : "",
	 pkeyMap : {},
	 resultsLoaded : false,
	 resultsParsed : false,
     selectedVertex : {},
	 originalResponse : {},
     edgeIndex : {},
	 nodeIndex : {},
	 infoPaneText : "",
	 curScale : 0,
	 scaleToShowLabels:2,
	 force : {},
	 graphComps :{},
	 traverseStrategy : ""
	 
  },
  mounted:function(){
	  
	/*  this.$nextTick(function(){
		var pkeyMap = new Set();
		this.curScale = 0;		 
	 }) */
  
	var pkeyMap = new Set();
		this.curScale = 0;	

	//svg.append("circle").attr("cx",10).attr("cy",10).attr("r",10);
	
	//this.$set('svg',svg)
	 
  },
  
  methods: {
	  
	 renderReady : function(){
		 if(dbHandler.selectedClass)
			 return true;
		 
		 else
			 return false;
	 },
	 findNode : function(name){
		 console.log(name, this.nodeIndex.get(name))
		 return this.nodeIndex.get(name);
	 },
	/**********************************************
	---------PARSE RESULTS------------------------
	1.If resetFlag is true, start with blank links and nodes objects
	2.Else, use the provided resultArr 
	3.separate nodes and links
	4.store the in and out node objects for each link
	**********************************************/
	parseResults : function(resetFlag, _resultArr){
		var _this = this;
		
		if(resetFlag)
		{
			_this.nodes = [];
			_this.links = [];
			_this.edgeIndex = new Map();
			_this.nodeIndex = new Map();
		}

		if(!_resultArr)  //no argument, use the resultArr from dbhandler
			var resultArr = dbHandler.resultArr
		else
			var resultArr = _resultArr;
		
		return new Promise(
		(resolve,reject) => {
			
			
			var pArr = [], lastIndex=-1,_this = this;
			
			//FUnction to fetch orphan vertex data
			var getByRid = function(_nodes,link,prop){
				
				var rid = link[prop];
				if(typeof(rid) == 'object') 
					rid  = link[prop].data['@rid']
				var nodes = _nodes, connectedDb = dbHandler.connectedDb;
				console.log('in function ',rid)
				var ridX = rid.slice(1).replace(':','_');
				
				return new Promise((resolve,reject) => {
					 var ajaxUrl = `/getByRid/${connectedDb}/${ridX}`;
					 console.log(ajaxUrl);
						_this.$http({url: ajaxUrl, method : 'GET'})
						.then( response => {
							var tmpIdx = _this.nodeIndex.get(rid);
							console.log('tmpIdx', tmpIdx);
							_this.nodes[tmpIdx].data = response.data;
							_this.nodes[tmpIdx].rid = rid;
							_this.nodes[tmpIdx].name = rid;
							link[prop] = _this.nodes[tmpIdx];
							resolve(1);
						},
						error => {
							console.log(error);
							reject(error);
						})
					
					 
				 } // END function
				); //END Promise
			} //END Function
			
			if(resultArr.length > 0){
				console.log('dbHandler.resultArr');
				//DIAGNOSIS CODE
				console.log(` DIAGNOSIS ... Total count of rows = ${dbHandler.resultArr.length}`);
				
			/****************************************
			COLLECT LINKS AND NODES from Result object
			******************************************/
				resultArr.forEach((e,i,a) => { // Run through all the result rows	
					var rid = e['@rid'];
					if(i == 0 && resetFlag) _this.rootRid = rid; //Root has to be chosen only for a fresh graph
					//console.log(`rid = ${rid} and class = ${e['@class']} and e.value.in = ${e.value.in} and e.value.out = ${e.value.in}`)
					if(e.in != undefined || e.out != undefined) // Collect Edges. **Push each edge into Links array
					{
						
						//console.log('')
						lastIndex = _this.links.push({
							source : e.out,
							target : e.in,
							class : e['@class'],
							rid : rid,
							type : "suit",
							data : e
						});
						console.log('edge collected', e['@class'],rid, lastIndex,_this.links[lastIndex-1])
						this.edgeIndex.set(rid,lastIndex-1);
					} 
					else{ // Collect Vertices. **Add a property with rid value to the nodes Object
						
						console.log(e);
						/* _this.nodes[rid] = {name : rid, rid : rid};
						_this.nodes[rid].class = e['@class'];
						_this.nodes[rid].data = e; */
						lastIndex = _this.nodes.push ({name : rid, 
											rid : rid,
											class : e['@class'],
											data : e});
						_this.nodeIndex.set(rid, lastIndex-1);
						console.log('node collected', e['@class'], rid,lastIndex,_this.nodes[lastIndex-1])
						console.log(_this.nodeIndex.get(rid));
						//console.log(_this.nodes[rid]);
					}
				}); //end forEach

			console.log(`Diagnosis.... node count = ${Object.getOwnPropertyNames(_this.nodes).length}  and links count = ${_this.links.length}`);
			console.log(_this.nodes,_this.nodeIndex)
			
			/************************************************* 
			---------LINKING THE NODES WITH LINKS-------------
			Run though all links(edges). 
			For each one, store the in and out node objects 
			     as "in" and "out" properties
			?? Can we make this run only for the new links??
			***************************************************/
			_this.links.forEach((e,i,a) => {  				
/* 				//fix any missing in/out edge arrays
				if(e.source) { // Set the OUT 
					//console.log('clas is = ' + e.class)
					var outArrName = "out_" + e.class;
					console.log('setting out edge array for ' + e.source + ' class '+ outArrName);
					console.log(this.nodes[e.source])
					if(!this.nodes[e.source].hasOwnProperty(outArrName)){ //Edge Array NOT present
						this.nodes[e.source][outArrName] = [];
						this.nodes[e.source][outArrName].push(e.rid);
					}
					else{ //Edge Array present
						var s = new Set(this.nodes[e.source][outArrName]);
						if (!s.has(e.rid)) //edge array does not have the edge rid
						  this.nodes[e.source][outArrName].push(e.rid);
					}
				}
				if(e.target){ //FIX the IN arrays
					//console.log('clas is = ' + e.class)
					var arrName = "in_" + e.class;
					if(!this.nodes[e.target].hasOwnProperty(arrName)){ //Edge Array NOT present
					
						this.nodes[e.target][arrName] = [];
						this.nodes[e.target][arrName].push(e.rid);
					}
					else{ //Edge Array present
						var s = new Set(this.nodes[e.target][arrName]);
						if (!s.has(e.rid)) //edge array does not have the edge rid
						  this.nodes[e.target][arrName].push(e.rid);
					}
					
				} */
				console.log('in inner function..', _this.nodeIndex, _this.nodes, e.source);
				var tmpIdx = _this.nodeIndex.get(e.source);
				console.log('in linking nodes...',e.source,e.target)
				console.log('source..', e.source, tmpIdx)
				if(tmpIdx){ // node exists,then point to the link
					e.source = _this.nodes[tmpIdx]; 				
				}
				else{				//node does not exists, fetch its data from a Promise
					lastIndex = _this.nodes.push( {name : e.source});
					_this.nodeIndex.set(e.source,lastIndex-1);
					//Fetch the vertex data by rid
					//console.log(`in else ${e.source}`);
					pArr.push(getByRid(_this.nodes,e,'source'))
				}
				tmpIdx = _this.nodeIndex.get(e.target);
				console.log('target..', e.target, tmpIdx)
				if(tmpIdx){
					e.target = _this.nodes[tmpIdx] 				
				}
				else{				
					lastIndex = _this.nodes.push({name : e.target});
					_this.nodeIndex.set(e.target,lastIndex-1);
					//console.log(`in else ${e.target}`);
					//Fetch the vertex data by rid
					pArr.push(getByRid(_this.nodes,e,'target'))
				}
			});
			console.log(`pArr length = ${pArr.length}`)
			} //end if
			console.log(`root rid = ${_this.rootRid}`)
			console.log('in outer.. ', _this.nodes, _this.nodeIndex)
			if(pArr.length == 0)
			{
				_this.resultsParsed = true;	
				resolve(1);
			}else
			{
				Promise.all(pArr)
				.then(vals => {console.log('parseResults complete..');
								resolve(vals);
					})
				.catch(e =>  {
					console.log('parseResults failed to complete..',e);
					reject(e);});
			}
		});
	},
	
	/**>>>>>>>>>>>>>>>>>>>
	   RENDER THE GRAPH
	<<<<<<<<<<<<<<<<<<<<*/
	
	renderGraph : function(resetFlag,_resultArr){
	
		var graph = new Graph();
		//graph.init();
		graph.beforeCreate();
		//console.log()
		graph.setDbHandler(dbHandler);
		graph.setInfoPane(infoPane);
		graph.setVueObj(this);
		showLoading(true);
		graph.render(resetFlag,_resultArr)
		.then(vals => {
			showLoading(false);
		})   
	}
   }
  })

var dbHandler = new Vue({

  // We want to target the div with an id of 'events'
  el: '#database_list',

  // Here we can register any values or collections that hold data
  // for the application
	 data: {
	  originalResponse : {}
	  ,dbs: []
	  ,classes : []
	  ,selectedDb: ""
	  ,connectedDb:""
	  ,selectedClass : ""
	  ,classProps : []
	  ,classPropMap : new Map()
	  ,getClassParams:{
		  className: ""
	  }
	  ,connParams:{
		  host : ""
		  ,port : ""
		  ,url : ''
		  ,osessionid : ""
		  ,user : ""
		  ,pass : ""
	  }
	  ,getVertexMap:{
		  className : ""
		  ,vertexName : ""
		  , depth : 10
		  ,strategy : ""
		  ,rowLimit : 0
	  }
	  ,classCriteria:[]
	  ,resultArr:[]
	},

	 // Anything within the ready function will run when the application loads
	mounted: function() {
	  // When the application loads, we want to call the method that initializes
	  // some data
	  
/* 	  this.$set('connParams.host',location.host.split(':')[0]);
	  this.$set('connParams.port',2480);
	  this.$set('connParams.url','http://'+this.connParams.host + ':' + this.connParams.port);*/
	  this.$nextTick(function(){
		this.classes = [];
		this.getDatabaseList(); 
		this.selectedClass = "";
		this.classProps = [];  
		});		  
	  
	  
	  //this.classPropMap = new Set();
	},


  // Methods we want to use in our application are registered here
  methods: {
		   // We dedicate a method to retrieving and setting some data
/* 	  getDatabaseList: function() {
		this.$http.get('http://localhost:2480/listDatabases',(data)=>{
			this.$set('dbs');
		}); */
		 getDatabaseList: function() {
			// GET request
			 var ajaxUrl = '/listDatabases';
			 
			this.$http({url: ajaxUrl, method: 'GET'}).then(function (response) {
			  
			  // success callback
			  
			  var bodyObj = {};
			  //dbsObj = eval(response.data);
			  console.log("typeof response " + typeof(response));
			  console.log(response)
			  if(typeof(response.body) == 'string')
			  {
				  bodyObj = JSON.parse(response.body);
			  }
			  else if(typeof(response.body) == 'string')
			  {
				  bodyObj = response.body;
			  }
			  
			  this.$set(this,'dbs',bodyObj.databases);
			 //this.$set(this,'dbs',[1,2]);
			  
		  }, function (response) {
			  // error callback
		  });
		 } ,
		 
		connectToDb:function(dbName){
			showLoading(true);
			this.$http({url:'/connect/'+dbName, method:"GET"})
			.then(response=>{
				this.connectedDb = dbName;
				console.log(response.data);
				this.$set(this,'classes', response.data.classList);
				showLoading(false);
				//console.log(this.classes);
			}
			,val=>{})
		},
		
		getVertexMapData : function(){

     		//console.log(this.classCriteria);
			dbHandler.getVertexMap.depth = 10;
			dbHandler.getVertexMap.strategy = 'BREADTH_FIRST';
			dbHandler.getVertexMap.rowLimit = 500;
			
			var url = 'getVertexMap/' + this.connectedDb + '/' + this.selectedClass;
	/* 		$.get(url, this.classCriteria, function(data){
				console.log(data);
			}) */
			showLoading(true);
		   Vue.http.post(url,{ classCriteria : this.classCriteria,
							depth : dbHandler.getVertexMap.depth})
			.then(res => {
				console.log("Begin Post response")
				console.log(res.data);
				//console.log(res.data.data.results[0].content[0].value.out_record_fields);
				//console.log(res.data.data.results[0].content[0].value.out_subrecords);
				console.log("END Post response")
				console.log('res.data.result-' + typeof(res.data.result));
				console.log(res.data.result);
			    this.$set(this,'resultArr',res.data.result);
				svgRenderer.$set(svgRenderer,'resultsLoaded',true);
				infoPane.$set(infoPane,'resultsLoaded',true);
				this.$set(this,'originalResponse',res);
				showLoading(false);
			},
			err =>{
				showLoading(false);
			}) 
		},
		
		getSelectedClassProps : function(className){
			if(!className){
				className = this.selectedClass
			}
			showLoading(true);
			this.$http({url:'/getClassProps/' + this.connectedDb + '/' + className})
			.then(res => {
				this.$set(this,'classProps',res.data.classProps);
				showLoading(false);
				console.log(this.classProps);
			},
			err => {
					showLoading(false);
			});
			
		},
		getClassPropMap : function(className){
			return new Promise((resolve,reject) => {
				var curPropMap = this.classPropMap.get(className);
				//if already exists, return curated array
				if(curPropMap){
						resolve(curPropMap);
				}
				
				this.$http({url:'/getClassProps/' + this.connectedDb + '/' + className, method:'GET'})
				.then(res => {
					//this.$set('classProps',res.data.classProps);
					var arr = res.data.classProps;
					var arr2 = [];
					arr.forEach((e,i,a) => {
						arr2.push(e.name);
					})
					this.classPropMap.set(className, arr2)
					//console.log(this.classProps);
					resolve(arr2);
				},
				err => {
					reject(err);
				});				
			})
			
			
		},
		addClassCriteria: function(){
		/* 	var temp  = classCriteria;
			temp.push({prop:'' , value:''});
			
			this.$set('classCriteria',temp); */
			this.classCriteria.push({prop:'' , value:''});
		},
		
		delCriteria: function(i){
			this.classCriteria.splice(i,1);
			
		}
		 
		}
  });
