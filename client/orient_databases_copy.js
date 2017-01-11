import Vue from 'vue'
import d3 from 'd3'
import $ from 'jquery'
//var Vue = require('vue');

class XForm{
	
	constructor(){
		this.obj = {};
		this.obj.translate = [];
		this.obj.scale = [];
	}
	

	setXForm(val){
		if(val == "" || val==undefined)
			new XForm();
		else{
		   val.split(')').forEach((e,i,a) => {
			if(e){
				var attr = e.split('(')[0];
				var args = e.split('(')[1].split(',');				
				this.obj[attr] = args;			
			}
			
		   })		
		
		}

	}
	setTranslate(x,y){
	        if(!y && x.length > 1) {
		    this.obj.translate = x
		}
		else	
		    this.obj.translate = [x,y];
		
	}
	addTranslateVals(x,y){
		
		this.obj.translate[0] = parseInt(this.obj.translate[0]) + x;
		this.obj.translate[1] = parseInt(this.obj.translate[1]) + y;
	}
	getTranslate(){
		return this.obj.translate;
	}
	addScale (val) {
		
	}
	setScale(val){
		this.obj.scale = [val];
	}
	getScale(){
		if(this.obj.scale[0])
			return this.obj.scale[0];
		else
			return 1;
	}
	getXFormString(){
		var val="", i;
		for(i in this.obj){
			if(this.obj[i].length > 0)
			   val += `${i}(${this.obj[i].join(',')})`;			
		}
		return val;	
	}
}

class AttrWrapper{
	constructor(){
   		this.entries = new Set();	
	}
	getValue() {
		var arr = [];
		this.entries.forEach(el => {arr.push(el)});
		return arr.join(' ');
	}
	setValue(val) {
		var str = val;
		this.entries.clear();
		val.split(' ').forEach(x => {
			if(x.trim().length > 0)
			   this.entries.add(x.trim());
		});
		return this;
		
		
	}
	add(val){
		if(val.trim().length > 0)
			this.entries.add(val.trim())
		return this;
	}
	remove(val){
		this.entries.delete(val);
		return this;
	}
	replace(oldV,newV){
		this.entries.delete(oldV);
		this.entries.add(newV.trim());
		return this;
	}

}
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
var propSelector = Vue.extend({
  template: "<div v-for='prop in classProps'> \
  {{prop.name}} \
  </div>"
})

// register
Vue.component('prop-selector', propSelector)

// create a root instance
new Vue({
  el: '#prop_selector'
})

 var infoPane = new Vue({
	el : '#info_pane',
	data : {
		infoPaneText : ''
	},
	ready : function(){
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
	 infoPaneText : "",
	 curScale : 0,
	 scaleToShowLabels:2,
	 force : {},
	 graphComps :{}
	 
  },
  ready:function(){
  
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
			_this.nodes = {};
			_this.links = [];
			this.edgeIndex = new Map();
		}

		if(!_resultArr)  //no argument, use the resultArr from dbhandler
			var resultArr = dbHandler.resultArr
		else
			var resultArr = _resultArr;
		
		return new Promise(
		(resolve,reject) => {
			
			
			var pArr = [];
			
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
							_this.nodes[rid].data = response.data;
							_this.nodes[rid].rid = rid;
							_this.nodes[rid].name = rid;
							link[prop] = _this.nodes[rid];
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
						var lastIndex = _this.links.push({
							source : e.out,
							target : e.in,
							class : e['@class'],
							rid : rid,
							type : "suit",
							data : e
						});
						console.log('inside if', e['@class'],rid, lastIndex)
						this.edgeIndex.set(rid,lastIndex-1);
					} 
					else{ // Collect Vertices. **Add a property with rid value to the nodes Object
						
						console.log(e);
						_this.nodes[rid] = {name : rid, rid : rid};
						_this.nodes[rid].class = e['@class'];
						_this.nodes[rid].data = e;
						console.log('inside else', e['@class'], rid,_this.nodes[rid])
						console.log(_this.nodes[rid]);
					}
				}); //end forEach

			console.log(`Diagnosis.... node count = ${Object.getOwnPropertyNames(_this.nodes).length}  and links count = ${_this.links.length}`);
			console.log(this.edgeIndex)
			
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
				if(_this.nodes[e.source]){ // node exists,then point to the link
					e.source = _this.nodes[e.source] 				
				}
				else{				//node does not exists, fetch its data from a Promise
					_this.nodes[e.source] = {name : e.source};
					//Fetch the vertex data by rid
					//console.log(`in else ${e.source}`);
					pArr.push(getByRid(_this.nodes,e,'source'))
				}
				
				if(_this.nodes[e.target]){
					e.target = _this.nodes[e.target] 				
				}
				else{				
					_this.nodes[e.target] = {name : e.target};
					//console.log(`in else ${e.target}`);
					//Fetch the vertex data by rid
					pArr.push(getByRid(_this.nodes,e,'target'))
				}
			});
			console.log(`pArr length = ${pArr.length}`)
			} //end if
			console.log(`root rid = ${_this.rootRid}`)
			if(pArr.length == 0)
			{
				_this.resultsParsed = true;	
				return true;
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
	var thisEl = this, path, circle, linksDelta, nodesDelta,force;
	showLoading(true);
	
	force = d3.layout.force();
	//this.nodes = force.nodes();
	//this.links = force.links();
	
	this.parseResults(resetFlag, _resultArr)
	.then(vals => { 
		console.log("after parseResults")
		     console.log(this.nodes);
			var xform = {x:0, y:0};
		   var dragPos = {x:0 , y:0};
			var nodes = thisEl.nodes;
	            var links = thisEl.links;
				//console.log(nodes);
				force.size([this.width-50, this.height-50])
				.linkDistance(30)
				.charge(-300)
				//.charge(10)
				.linkDistance(100)
				.alpha(0.1)
				//.nodes(d3.values(nodes))
				//.links(links)
				.on("tick", tick)
				//.start();
		    thisEl.force  = force;
	      d3.select("#svg_area").select("svg").remove();
		  var drag = d3.behavior.drag();
		  var xform = new XForm();	
		  var zoom = d3.behavior.zoom().scaleExtent([1,10]);	
			
		
		  var svg = d3.select("#svg_area")
					.append("svg")
					.attr("width",this.width)
					.attr("height",this.height)
					.call(drag)
					.call(zoom);
		//			.append('g')
		//			.call(d3.bhavior.zoom().scaleExtent([1,10]).on('zoom',zoom));

		  var canvasG = svg.append("g")
					.attr("transform", "translate("+this.margin.left + "," + this.margin.top + ")" )
				//	.call(zoom)
				//	.append('g');
			
			this.graphComps.circleG = canvasG.append('g');	
			this.graphComps.pathG = canvasG.append('g');			
			if(this.graphComps.textG)
				this.graphComps.textG.remove();
			else
				this.graphComps.textG = canvasG.append("g"); 
	      // var linkElems = canvasG.append("g").selectAll('.link');
		 //  var nodeElems = canvasG.append("g").selectAll('.link');
		   
			drag.on("dragstart", () => {
				xform.setXForm(canvasG.attr("transform"));
				//var xlate = this.parseTransform(canvasG.attr("transform"),"translate");
				//console.log(this.getTransform(canvasG.attr("transform")));
				//console.log(xform.getTranslate());
				xform.x = parseInt(xform.getTranslate()[0]); //store the current xform
				xform.y = parseInt(xform.getTranslate()[1]);
				dragPos.x = d3.event.sourceEvent.pageX; //store the starting drag coord
				dragPos.y = d3.event.sourceEvent.pageY;
			})
			.on("drag", () => {
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
			})
			.on("dragend", () => {
				
			})
			
			zoom.on('zoom' , () => {
				
				xform.setXForm(canvasG.attr('transform'));
				//var xformG = canvasG.attr('transform');
				//console.log('d3.event.scale=',d3.event.scale)
				var curScale = parseInt(xform.getScale());
				//var factor = (d3.event.scale - curScale)/4;
			        //console.log(d3.event.translate)
				xform.setTranslate(d3.event.translate);
				xform.setScale(d3.event.scale);
				this.$set('curScale',d3.event.scale);
				var xFormVal = xform.getXFormString();
				console.log(`curScale -> ${curScale}, scale -> getXFormString ',${xFormVal}`)
				//xform.setTranslate(d3.event.translate.split(','));
				canvasG.attr("transform",xFormVal); // new translate
				if(thisEl.graphComps.textG)  {
						if(this.curScale >= this.scaleToShowLabels )
							thisEl.graphComps.textG.attr('visibility','true');
						else
							thisEl.graphComps.textG.attr('visibility','hidden');
					
				}
			});
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
				
			/* canvasG.selectAll('defs').append('marker')
				.attr("id", "linkBegin")
				//.attr("viewBox", "0 0 10 10")
				//.attr("refX", 5)
				//.attr("refY", 5)
				//.attr("markerWidth", 6)
				//.attr("markerHeight", 6)
				.attr("orient", "auto")
				.append("circle").attr("cx",2).attr("cy",2).attr("r",2)
//				.append("rect").attr("x",1).attr("y",1).attr("height",5).attr("width",5); */
			

			function expandVertex(d)	{
				d3.event.stopPropagation();
				console.log('inside dblclick..');
				console.log(d);
				dbHandler.getVertexMap.depth = 2;
				dbHandler.getVertexMap.strategy = 'BREADTH_FIRST';
				dbHandler.getVertexMap.rowLimit = 30;
				
				//1. get the clicked vertex's class
				var className = d.data['@class'];
				//2. get the class's keys
				Vue.http.get('/getClassProps/' + dbHandler.connectedDb + '/' + className)
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
					var url = 'getVertexMap/' + dbHandler.connectedDb + '/' + className;
					Vue.http.post(url,{ classCriteria : classCriteria,
							depth : dbHandler.getVertexMap.depth,
							strategy : dbHandler.getVertexMap.strategy,
							rowLimit : dbHandler.getVertexMap.rowLimit})
							.then(res => {
								console.log("Expand vertex response");
								console.log(res.data.result);
								//5. parse the results
								//thisEl.renderGraph(false,res.data.result)
								thisEl.parseResults(false,res.data.result)
		 						.then(
									res => {
									//6. update the graph
									//thisEl.force.nodes(d3.values(thisEl.nodes))
/* 									.links(thisEl.links)
									.on('tick',tick)
									.start(); */
									draw();
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
				console.log(d);
				/* 	div.transition()
						.duration(500)
						.style("opacity",0)
						.transition(500)
						.style("opacity",.9); */	
						
					//ajax call to get the propSelector
					var className = d.data['@class'];
					//var ajaxUrl = `/getClassProps/{dbHandler.connectedDb}/{className}`;
					var htmlText = "";
					var _d3 = d3, ex = d3.event.pageX + 10 , ey =d3.event.pageY + 10;
					//console.log(`ex = ${ex}, ey = ${ey}`)
					dbHandler.getClassPropMap(className)					
					.then(val => {
						var str = `class : <b> ${d.data['@class']} </b> <br>`;
						str += `rid : <b> ${d.data['@rid']}</b><br>`;
						val.forEach((e,i,a) => {
							str += ` ${e} : <b> ${d.data[e]} </b> <br>`;
						});
						htmlText = `${str} <br>` ;
						//console.log(htmlText)
						infoPane.$set('infoPaneText',htmlText);
						/* div.html(htmlText)
							.style("left", (ex) + "px")             
							.style("top", (ey) + "px"); */
					})
					.catch(e => {
						console.log('onmouse fail -',e)
					})

				}
				
			function colorEdges(edgeArr, direction){
				var classVal = "", attrW = new AttrWrapper(),oldVal = "", newVal = "";
				
				if (direction == "in") classVal = "in_link"
				else classVal = "out_link";
				
				console.log("outside ."+classVal)
				
				console.log("edgeArr");
				console.log(edgeArr);
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
				//d3.select(this).style('fill','yellow');
				//d3.select(this).attr('class','selected_node')
				//reset old selected Node
				var attr = new AttrWrapper();
				
				if(thisEl.selectedNode){
					var t = attr.setValue(thisEl.selectedNode.attr("class")).remove('selected_node').getValue();
					console.log(t)
					thisEl.selectedNode.attr("class",t);
				
				}
				 //  thisEl.selectedNode.attr("class", "deselected_node" );
				//store the node
				var selected = d3.select(this);				
				thisEl.selectedNode = selected;	
				//apply style to the selected node
				selected.attr("class", attr.setValue(selected.attr("class")).add("selected_node").getValue());

				//color all the
				var inEdgeArr=[], outEdgeArr = []; 
				console.log(thisEl.nodes[d.name]);

				for (var prop in thisEl.nodes[d.name].data)
				{
					if (prop.startsWith("in_")) inEdgeArr = inEdgeArr.concat(thisEl.nodes[d.name].data[prop]);
					else
						if(prop.startsWith("out_")) outEdgeArr= outEdgeArr.concat(thisEl.nodes[d.name].data[prop]);

				}
				console.log(`inEdgeArr = ${inEdgeArr}`);
				console.log(`outEdgeArr = ${outEdgeArr}`);
				resetEdgeColors();
				colorEdges(inEdgeArr, "in");
				colorEdges(outEdgeArr, "out");
				//console.log(dbHandler.resultArr);
				//console.log(dbHandler.originalResponse)
			}
			
  /*            var textG = canvasG.append("g");
			this.edgeIndex.forEach( (e,i,a) => {
				textG.append("text").append("textPath")
				.attr("xlink:href","#" + i.replace('#','r').replace(':','-')) // i is the key
				.attr("text",this.links[e].class)  //e is the value
			})	 */
			
				
			var text = thisEl.graphComps.textG.selectAll("text")
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
				thisEl.graphComps.textG.attr('visibility','true')
			else
				thisEl.graphComps.textG.attr('visibility','hidden')
			
				

			
			// Use elliptical arc path segments to doubly-encode directionality.
			function tick() {
				 if(thisEl.path)
					thisEl.path.attr("d", linkArc);
				if(thisEl.circle)
					thisEl.circle.attr("transform", transform); 
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

			function transform(d) {
			  return "translate(" + d.x + "," + d.y + ")";
			}	
			function dblclick(d) {
			  d3.select(this).classed("fixed", d.fixed = false);
			}

			function dragstart(d) {
			  d3.select(this).classed("fixed", d.fixed = true);
			}	
			
			
			function draw(){
				
				force.nodes(d3.values(thisEl.nodes));
				force.links(thisEl.links);
				
				 /***********************
				 ADD LINKS to SVG
				 ************************/								
				var linkData = thisEl.graphComps.circleG
					.style('z-index',3)
					.selectAll("path")
					.data(force.links(), d => {return d.rid});
				console.log('force.links.....')
				console.log(linkData);
				
				thisEl.path = linkData.enter().append("path")
					.attr("class", function(d) { return "link " + d.type; })
					.attr("id",function(d){ return d.rid.replace('#','r').replace(':','-'); })
					//.attr("marker-start"k,"url(#linkBegin)")
					.attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
					.on("mouseover",fetchLabelInfo)
				 var nodeData = thisEl.graphComps.pathG
				  .style('z-index',4)
				  .selectAll("circle")
				  .data(force.nodes(), d => {return d.rid})
				  
				console.log('force.nodes.....')
				console.log(nodeData);	 
				 /***********************
				 ADD NODES to SVG
				 ************************/
				 thisEl.circle = nodeData.enter().append("circle")
					.attr("r", 6)
					.attr("class", d => {
						//console.log(d.name)
						if(d.name == thisEl.rootRid) 
							{
								console.log("root!")
								return "root-vertex node";
								}
						else return "branch-vertex node"
					})	
					.on('click', selectVertex)
					.on("mouseover",fetchLabelInfo)
					.on('dblclick',expandVertex)
					force.start();
					console.log(thisEl.links)
			}	
		draw();
	showLoading(false);	
	})
	.catch(e => {
		console.log('Parseresults failed ', e)
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
	  
	  dbs: []
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
	ready: function() {
	  // When the application loads, we want to call the method that initializes
	  // some data
	  
/* 	  this.$set('connParams.host',location.host.split(':')[0]);
	  this.$set('connParams.port',2480);
	  this.$set('connParams.url','http://'+this.connParams.host + ':' + this.connParams.port);*/
	  this.classes = [];
	  this.getDatabaseList(); 
	  this.selectedClass = "";
	  this.classProps = [];
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
			  console.log(response)
			  this.$set('dbs',response.data.databases);
			  
		  }, function (response) {
			  // error callback
		  });
		 } ,
		 
		connectToDb:function(dbName){
			showLoading(true);
			this.$http({url:'/connect/'+dbName, method:"GET"})
			.then(response=>{
				this.connectedDb = dbName;
				this.$set('classes', response.data.classList);
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
			    this.$set('resultArr',res.data.result);
				svgRenderer.$set('resultsLoaded',true);
				infoPane.$set('resultsLoaded',true);
				this.$set('originalResponse',res);
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
				this.$set('classProps',res.data.classProps);
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
