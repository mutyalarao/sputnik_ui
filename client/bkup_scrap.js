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
				var nodeIdx = thisEl.findNode(d.name);
				console.log(thisEl.nodes[nodeIdx]);

				for (var prop in thisEl.nodes[nodeIdx].data)
				{
					if (prop.startsWith("in_")) inEdgeArr = inEdgeArr.concat(thisEl.nodes[nodeIdx].data[prop]);
					else
						if(prop.startsWith("out_")) outEdgeArr= outEdgeArr.concat(thisEl.nodes[nodeIdx].data[prop]);

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
				
				force.nodes(thisEl.nodes);
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
				console.log(linkData.enter())
				console.log(force.nodes());
				thisEl.path = linkData.enter().append("path")
					.attr("class", function(d) { return "link " + d.type; })
					.attr("id",function(d){ return d.rid.replace('#','r').replace(':','-'); })
					//.attr("marker-start"k,"url(#linkBegin)")
					.attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
					.on("mouseover",fetchLabelInfo)
				 /***********************
				 ADD NODES to SVG
				 ************************/					
				 var nodeData = thisEl.graphComps.pathG
				  .style('z-index',4)
				  .selectAll("circle")
				  .data(force.nodes(), d => {
					  //console.log(d.rid);
					  return d.name})
				  
				console.log('force.nodes.....')
				console.log(nodeData);	
				console.log(nodeData.enter())				

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
					console.log(thisEl.nodes)
					console.log(thisEl.links)
			}	
		draw();
	showLoading(false);	
	})
	.catch(e => {
		console.log('Parseresults failed ', e)
	})