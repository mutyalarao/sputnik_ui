import Vue from 'vue/dist/vue.js'
//import * as d3 from 'd3';
var d3 = require('d3')
//import XForm from './utils.js'
//import AttrWrapper from './utils.js'
var XForm = require('./utils.js').XForm;
var AttrWrapper = require('./utils.js').AttrWrapper;
//var __this;
class Graph{
	constructor(){
//		this.dataAgent = new DataAgent();
		this.svgEl = {}
		this.nodes = [];
		this.links = [];
		this.nodeIndex = new Map();
		this.edgeIndex = new Map();
		this.dataAgent = {};
		this.cx = 10;
		this.cy = 10;
		this.margin = {left:10,right:10,top:10,bottom:10};
		this.width = 1200;
		this.height = 800;
		this.scaleToShowLabels = 2;
	}

	beforeCreate(){
		//this.force = d3.layout.force();		
		console.log('testing graph...',d3.selectAll('body'));
		this.nodes = [];
		this.links = [];
		this.edgeIndex = new Map();
		this.nodeIndex = new Map();
	}
	
	setDataAgent(dataAgent){
		this.dataAgent = dataAgent;
	}
	
	reset(){
		
	}
	
	setDbHandler(val){
		this.dbHandler = val;
		
	}
	
	setVueObj(obj) {this.vue = obj}
	
	setInfoPane(obj) {this.infoPane = obj}
	
	setDataAgent(obj){
		this.dataAgent = obj;
	}
	
	draw(){
		
	}
	
	addNode(obj){
		var nodeExists = this.findNode(obj.name);
		if(nodeExists)
			return nodeExists;
		else{
			var lastIndex = this.nodes.push(obj);
			//if(obj.data)
			var rid = obj.name;
		//	else
			//	var rid = "";
			
			console.log('node collected', obj['@class'],rid, lastIndex,this.nodes[lastIndex-1])
			this.nodeIndex.set(rid,lastIndex-1);				
		}	
	}
		
	addLink(obj){
		var linkExists  = this.findEdge(obj.rid);
		if(linkExists)
			return linkExists;
		else{
			var lastIndex = this.links.push(obj), rid = obj.data['@rid'];
			console.log('edge collected', obj['@class'],rid, lastIndex,this.links[lastIndex-1])
			this.edgeIndex.set(rid,lastIndex-1);
		}
	}

	findNode(name){
		return this.nodeIndex.get(name);
	}

	findEdge(name){
		return this.edgeIndex.get(name);			
	}

	getByRid(_nodes,link,prop){
				
				var rid = link[prop];
				console.log("link[prop] = ",link[prop])
				if(typeof(rid) == 'object') 
					rid  = link[prop].data['@rid']
				var nodes = _nodes //connectedDb = dbHandler.connectedDb;
				console.log('in function ',rid)
				var ridX = rid.slice(1).replace(':','_');
				
				return new Promise((resolve,reject) => {
					//var connectedDb = this.dataAgent.getDbName();
					var ajaxUrl = `/getByRid/${this.dbHandler.connectedDb}/${ridX}`;
					console.log(ajaxUrl);
					this.vue.$http({url: ajaxUrl, method : 'GET'})				
	//						this.$http({url: ajaxUrl, method : 'GET'})
							.then( response => {
								var tmpIdx = this.findNode(rid);
								console.log('getByRid Promise success - tmpIdx', tmpIdx, response, rid);
								
								this.nodes[tmpIdx].data = response.data;
								this.nodes[tmpIdx].rid = rid;
								this.nodes[tmpIdx].name = rid;
								link[prop] = this.nodes[tmpIdx];
								resolve(1);
							},
							error => {
								console.log(error);
								reject(error);
							})
					
					 
				 } // END function
				); //END Promise
	} //END Function
			
	parseResults(resetFlag,_resultArr) {
		
		if(resetFlag)
		{
			//this.init();
			this.beforeCreate();
		}

		if(!_resultArr)  //no argument, use the resultArr from dbhandler
			this.resultArr = this.dbHandler.resultArr
		else
			this.resultArr = _resultArr;
		
		return new Promise(
		(resolve,reject) => {		
			
			var pArr = [], lastIndex=-1,_this = this;			
			//FUnction to fetch orphan vertex data
	
			
			if(this.resultArr.length > 0){
				//DIAGNOSIS CODE
				console.log(` DIAGNOSIS ... Total count of rows = ${this.dbHandler.resultArr.length}`);
			/****************************************
			COLLECT LINKS AND NODES from Result object
			******************************************/
				this.resultArr.forEach((e,i,a) => { // Run through all the result rows	
					var rid = e['@rid'];
					if(i == 0 && resetFlag) this.rootRid = rid; //Root has to be chosen only for a fresh graph

					if(e.in != undefined || e.out != undefined) // Collect Edges. **Push each edge into Links array
					{
						
						this.addLink({
							source : e.out,
							target : e.in,
							class : e['@class'],
							rid : rid,
							type : "suit",
							data : e
						});

					} 
					else{ // Collect Vertices. **Add a property with rid value to the nodes Object
						
						console.log(e);
						/* _this.nodes[rid] = {name : rid, rid : rid};
						_this.nodes[rid].class = e['@class'];
						_this.nodes[rid].data = e; */
			//			if(!findNode(rid)){ // If  exists, do not add
							this.addNode({name : rid, 
											rid : rid,
											class : e['@class'],
											data : e});
												
	/* 						lastIndex = this.nodes.push ({name : rid, 
												rid : rid,
												class : e['@class'],
												data : e});
							this.nodeIndex.set(rid, lastIndex-1); */
							//console.log('node collected', e['@class'], rid,lastIndex,this.nodes[lastIndex-1])
							console.log(this.nodeIndex.get(rid));							
				//		}						//console.log(_this.nodes[rid]);
					}
				}); //end forEach

			console.log(`Diagnosis.... node count = ${Object.getOwnPropertyNames(this.nodes).length}  and links count = ${this.links.length}`);
			console.log(this.nodes,this.nodeIndex)
			
			/************************************************* 
			---------LINKING THE NODES WITH LINKS-------------
			Run though all links(edges). 
			For each one, store the in and out node objects 
			     as "in" and "out" properties
			?? Can we make this run only for the new links??
			***************************************************/
			_this.links.forEach((e,i,a) => {  				
				//console.log('in inner function..', this.nodeIndex, this.nodes, e.source);
				console.log('in linking nodes...',e.source,e.target)
				var nodeName;

				if(typeof(e.source) == 'object') nodeName = e.source.rid;
				else nodeName = e.source;
				
				var tmpIdx = this.findNode(nodeName);				
				console.log('source..', e.source, tmpIdx)
				
				if(tmpIdx!=undefined){ // node exists,then point to the link
					e.source = this.nodes[tmpIdx]; 				
				}
				else{				//node does not exists, fetch its data from a Promise
					//lastIndex = this.nodes.push( );					
					lastIndex = this.addNode({name : nodeName})
					//this.nodeIndex.set(e.source,lastIndex-1);
					//Fetch the vertex data by rid
					//console.log(`in else ${e.source}`);
					pArr.push(this.getByRid(this.nodes,e,'source'))
				}
				
				if(typeof(e.target) == 'object') nodeName = e.target.rid;
					else nodeName = e.target;
					
				tmpIdx = this.findNode(nodeName); //Find Target node
				console.log('target..', e.target, tmpIdx)
				
				if(tmpIdx!=undefined){ //Node found. Link it.
					e.target = this.nodes[tmpIdx] 				
				}
				else{ //NOT found, Fetch it.
					var nodeName;
					
					this.addNode({name : nodeName});
					//_this.nodeIndex.set(e.target,lastIndex-1);
					//console.log(`in else ${e.target}`);
					//Fetch the vertex data by rid
					pArr.push(this.getByRid(this.nodes,e,'target'))
				}
			});
			console.log(`pArr length = ${pArr.length}`)
			} //end if
			console.log(`root rid = ${_this.rootRid}`)
			console.log('in outer.. ', _this.nodes, _this.nodeIndex)
			if(pArr.length == 0)
			{
				this.resultsParsed = true;	
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
		
	}
	

	// ++++++++++++++++
	// MAIN Renderer
	//++++++++++++++++
	render(resetFlag,_resultArr){		
		
		var _this = this, __this = this;
		//this.nodes = force.nodes();
		//this.links = force.links();
		return new Promise((resolve,reject)=>{
			this.parseResults(resetFlag, _resultArr)
			.then(vals => { 
				console.log("after parseResults")
				console.log(this.nodes);
				//var force = d3.layout.force();  
				//v4 change
				var force = d3.forceSimulation()
					.force("center",d3.forceCenter())
					.force("link")
					
				var xform = {x:0, y:0};
				var dragPos = {x:0 , y:0};
				var nodes = this.nodes;
				var links = this.links;
				//console.log(nodes);
				//force.size([this.width-50, this.height-50])
				//.linkDistance(30)
				//.charge(-300)
				//.charge(10)
				//.linkDistance(100)
				//.alpha(0.1)
				//force.nodes(d3.values(nodes))				
				//force.on("tick", tick);
				//force.force("link").links(links);
				//.start();
				this.force  = force;
			  d3.select("#svg_area").select("svg").remove();
			  var drag = d3.drag();
			  var xform = new XForm();	
			  var zoom = d3.zoom().scaleExtent([1,10]);			
			  var svg = d3.select("#svg_area")
						.append("svg")
						.attr("width",this.width)
						.attr("height",this.height)
						.call(drag)
						.call(zoom);

			  var canvasG = svg.append("g")
						.attr("transform", "translate("+this.margin.left + "," + this.margin.top + ")" )
				
				this.graphComps = {};
				this.graphComps.circleG = canvasG.append('g');	
				this.graphComps.pathG = canvasG.append('g');			
				if(this.graphComps.textG)
					this.graphComps.textG.remove();
				else
					this.graphComps.textG = canvasG.append("g"); 

			   
				drag.on("start", () => {
					xform.setXForm(canvasG.attr("transform"));
					//var xlate = this.parseTransform(canvasG.attr("transform"),"translate");
					//console.log(this.getTransform(canvasG.attr("transform")));
					//console.log(xform.getTranslate());
					xform.x = parseInt(xform.getTranslate()[0]); //store the current xform
					xform.y = parseInt(xform.getTranslate()[1]);
					dragPos.x = d3.event.sourceEvent.pageX; //store the starting drag coord
					dragPos.y = d3.event.sourceEvent.pageY;
				})
				.on("drag",dragHandler)			
				zoom.on('zoom' , zoomHandler);
				
			// Per-type markers, as they don't inherit styles.
				canvasG.append("defs").selectAll("marker")
					.data(["suit", "licensing", "resolved"])
				  .enter().append("marker")
					.attr("id", function(d) { return d; })
					.attr("viewBox", "0 -5 10 10")
					.attr("refX", 15)
					.attr("refY", -1.5)
					.attr("markerWidth", 6)
					.attr("markerHeight", 6)
					.attr("orient", "auto")
				  .append("path")
					.attr("d", "M0,-5L10,0L0,5"); 
					
				var text = this.graphComps.textG.selectAll("text")
					.data(this.links)
					.enter()
					.append("text")
					.attr('text-anchor','middle')
					.append("textPath")
					.attr('font-family','Tahoma')
					.attr("font-size","5")
					.attr("xlink:href", (d) => {
						return "#" + d.data['@rid'].replace('#','r').replace(':','-')
					}) 
					.text((d)=>{ return d.data['@class']});  
					//.text(function(d) { return d.name; });
				if(this.curScale >= this.scaleToShowLabels )
					this.graphComps.textG.attr('visibility','true')
				else
					this.graphComps.textG.attr('visibility','hidden')
				this.update();
				
				//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>!!!
				//>>>>>>>INTERNAL FUNCTIONS BELOW >>>>!!!
				function tick() {
						//console.log('inside tick')
						 if(_this.path)
							_this.path.attr("d", linkArc);
						if(_this.circle)
							_this.circle.attr("transform", transform); 
						// nodeElems.attr("transform",transform);
						// linkElems.attr("d",linkArc);
					  //text.attr("transform", transform);
				}
				function linkArc(d) {
				  var dx = d.target.x - d.source.x,
					  dy = d.target.y - d.source.y,
					  dr = Math.sqrt(dx * dx + dy * dy);
				  //return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
				  return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
				}
				
				function  transform(d) {
				  return "translate(" + d.x + "," + d.y + ")";
				}	
				function dragstart(d) {
				  d3.select(this).classed("fixed", d.fixed = true);
				}
				function zoomHandler(){				
					xform.setXForm(canvasG.attr('transform'));
					//var xformG = canvasG.attr('transform');
					//console.log('d3.event.scale=',d3.event.scale)
					var curScale = parseInt(xform.getScale());
					//var factor = (d3.event.scale - curScale)/4;
						//console.log(d3.event.translate)
					xform.setTranslate(d3.event.translate);
					xform.setScale(d3.event.scale);
					_this.curScale = d3.event.scale;
					var xFormVal = xform.getXFormString();
					console.log(`curScale -> ${this.curScale}, scale -> getXFormString ',${xFormVal}`)
					//xform.setTranslate(d3.event.translate.split(','));
					canvasG.attr("transform",xFormVal); // new translate
					if(_this.graphComps.textG)  {
							if(_this.curScale >= _this.scaleToShowLabels )
								_this.graphComps.textG.attr('visibility','true');
							else
								_this.graphComps.textG.attr('visibility','hidden');
					
					}
				}
	
				function dragHandler(){

					var eX = d3.event.sourceEvent.pageX;  //current mouse coord
					var eY = d3.event.sourceEvent.pageY;
					var  x_ = eX - dragPos.x; //delta
					var  y_ = eY - dragPos.y;
					var xform2 = new XForm();
					xform2.setXForm(xform.getXFormString());
					xform2.addTranslateVals(x_,y_);
					var xFormVal = xform2.getXFormString();
					//console.log('drag -> getXFormString ',xFormVal)
					canvasG.attr("transform",xFormVal); // new translate
				
				}
			resolve(1);
		 })
		 .catch(err => {reject(err);});
			
		}); // END return Promise

	} //END function
	 
	update(){
		var _this = this;
		console.log('in update function')
		this.force.nodes(this.nodes)
		.on("tick", tick);
		this.force.force("link").links(this.links);
		console.log(this.force.nodes())
		 /***********************
		 ADD LINKS to SVG
		 ************************/								
		var linkData = this.graphComps.circleG
			.style('z-index',3)
			.selectAll("path")
			.data(this.force.links(), d => {return d.rid});
		console.log('force.links.....')
		console.log(linkData);
		console.log(linkData.enter())
		console.log(this.force.nodes());
		this.path = linkData.enter().append("path")
			.attr("class", function(d) { return "link " + d.type; })
			.attr("id",function(d){ return d.rid.replace('#','r').replace(':','-'); })
			//.attr("marker-start"k,"url(#linkBegin)")
			.attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
			.on("mouseover",fetchLabelInfo)
		 /***********************
		 ADD NODES to SVG
		 ************************/					
		 var nodeData = this.graphComps.pathG
		  .style('z-index',4)
		  .selectAll("circle")
		  .data(this.force.nodes(), d => {
			  //console.log(d.rid);
			  return d.name})
		  
		console.log('force.nodes.....')
		console.log(nodeData);	
		console.log("nodeData.enter",nodeData.enter())				
		console.log("this.force.nodes()",this.force.nodes());
		 this.circle = nodeData.enter().append("circle")
			.attr("r", 6)
			.attr("class", d => {
				//console.log(d.name)
				if(d.name == this.rootRid) 
					{
						console.log("root!")
						return "root-vertex node";
						}
				else return "branch-vertex node"
			})	
			.on('click', selectVertex)
			.on("mouseover",fetchLabelInfo)
			.on('dblclick',expandVertex)
			this.force.start();
			console.log("this.nodes .. this.links...")
			console.log(this.nodes);
			console.log(this.links);
			
			//#####################################################
			//>>>>>>>>>>>>>>>>> EVENT Handler Definitions >>>>>>>>>>		


			function dblclick(d) {
			  d3.select(this).classed("fixed", d.fixed = false);
			}

			
			function expandVertex(d)	{
				d3.event.stopPropagation();
				console.log('inside dblclick..');
				console.log(d);
				var depth = 2;
				var strategy = 'BREADTH_FIRST';
				var rowLimit = 30;
				
				//1. get the clicked vertex's class
				var className = d.data['@class'], ajaxUrl = '/getClassProps/' + _this.dbHandler.connectedDb + '/' + className;
				//2. get the class's keys
				_this.vue.$http({url: ajaxUrl, method:'GET'})
				.then(res => {
					var props = res.data.classProps;
					var classCriteria = [];
					//3. form the criteria using the keys
					props.forEach((e,i,a) => {
						classCriteria.push({prop : e.name, 
						value : d.data[e.name] //quotes will be handled in caller
						});
					}); //end of forEach
					//4. call getVertexMap
					var url = 'getVertexMap/' + _this.dbHandler.connectedDb + '/' + className;
					_this.vue.$http.post(url,{ classCriteria : classCriteria,
							depth : depth,
							strategy : strategy,
							rowLimit : rowLimit})
							.then(res => {
								console.log("Expand vertex response");
								console.log(res.data.result);
								//5. parse the results
								//thisEl.renderGraph(false,res.data.result)
								_this.parseResults(false,res.data.result)
								.then(
									res => {
									//6. update the graph
									//thisEl.force.nodes(d3.values(thisEl.nodes))
									/* 									.links(thisEl.links)
									.on('tick',tick)
									.start(); */
									_this.update();
									},
									err => {
										console.log(err)
								}) 
								
							},
							err => {
								console.log("Failed in Expanding vertex" , err)
							})
				}
				,err => {
					
				})
			}
					
			function fetchLabelInfo(d) {
				//console.log(d);
					//ajax call to get the propSelector
					console.log(d);
					var className = d.data['@class'];
					//var ajaxUrl = `/getClassProps/{dbHandler.connectedDb}/{className}`;
					var htmlText = "";
					var _d3 = d3, ex = d3.event.pageX + 10 , ey =d3.event.pageY + 10;
					//console.log(`ex = ${ex}, ey = ${ey}`)
					console.log(this)
					_this.dbHandler.getClassPropMap(className)					
					.then(val => {
						var str = `class : <b> ${d.data['@class']} </b> <br>`;
						str += `rid : <b> ${d.data['@rid']}</b><br>`;
						val.forEach((e,i,a) => {
							str += ` ${e} : <b> ${d.data[e]} </b> <br>`;
						});
						htmlText = `${str} <br>` ;
						//console.log(htmlText)
						_this.infoPane.$set('infoPaneText',htmlText);

					})
					.catch(e => {
						console.log('onmouse fail -',e)
					})

				}
						
			function colorEdges(edgeArr, direction){
				var classVal = "", attrW = new AttrWrapper(),oldVal = "", newVal = "";
				
				if (direction == "in") classVal = "in_link"
				else classVal = "out_link";
				
				//console.log("outside ."+classVal)
				
				//console.log("edgeArr");
				//console.log(edgeArr);
				if(edgeArr)
				{
					edgeArr.forEach((e,i,a) => {
					var htmlId = "#"+e.replace('#','r').replace(':','-');
					var path = d3.select(htmlId), attrW = new AttrWrapper(); 
					console.log(`htmlId = ${htmlId} and path is below:`);
					console.log(path[0][0]);
					if(path[0][0]){
						var val = attrW.setValue(path.attr("class")).add(classVal).getValue();
						console.log(`${e} - ${htmlId} - attr=${attrW} - ${path.attr('class')}`);
						path.attr("class", val);
						}
					})
				}

			}
			function resetEdgeColors(){
				function resetEdge(classVal){
					var oldVal = "", newVal = "",attrW = new AttrWrapper();
					if(d3.selectAll("."+classVal)[0].length > 0){
						//console.log("."+classVal)
						
						oldVal = d3.selectAll("."+classVal).attr("class"); //store old value
						newVal = attrW.setValue(oldVal).remove(classVal).getValue(); //remove the color from old value
						d3.selectAll("."+classVal).attr("class",newVal); //assign the new value
					}
				}				
				resetEdge("in_link");
				resetEdge("out_link");
			}
			
			function selectVertex(d)  {				
						//reset old selected Node				
						var attrW = new AttrWrapper();				
						if(_this.selectedNode){
							var t = attrW.setValue(_this.selectedNode.attr("class")).remove('selected_node').getValue();
							console.log(t)
							_this.selectedNode.attr("class",t);			
						}
						 //  thisEl.selectedNode.attr("class", "deselected_node" );
						//store the node
						var selected = d3.select(this);				 // ??
						_this.selectedNode = selected;	
						console.log('attrW',attrW);
						//apply style to the selected node
						selected.attr("class", attrW.setValue(selected.attr("class")).add("selected_node").getValue());

						//color all the
						var inEdgeArr=[], outEdgeArr = []; 
						var nodeIdx = _this.findNode(d.name);
						console.log(_this.nodes[nodeIdx]);

						for (var prop in _this.nodes[nodeIdx].data)
						{
							if (prop.startsWith("in_")) inEdgeArr = inEdgeArr.concat(_this.nodes[nodeIdx].data[prop]);
							else
								if(prop.startsWith("out_")) outEdgeArr= outEdgeArr.concat(_this.nodes[nodeIdx].data[prop]);

						}
						console.log(`inEdgeArr = ${inEdgeArr}`);
						console.log(`outEdgeArr = ${outEdgeArr}`);
						resetEdgeColors();
						colorEdges(inEdgeArr, "in");
						colorEdges(outEdgeArr, "out");
					}
			
			
	}
	
		
}


module.exports = Graph ;
