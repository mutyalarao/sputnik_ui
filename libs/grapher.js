class Grapher{
	//raw is an Array
	//Each element is  an object
	// --if the object has 'in' or 'out' it is a 'Edge'
	// -- else, a Vertex
	// For a Vertex, 
	constructor(){
		this.vertices = [];
		this.edges = []
	}
	
	constructor(raw)
	{
		this.raw = raw;
		this.vertices = [];
		this.edges = [];
		this.d3={};
	}
	//separate vertices
	parse(){
		this.raw.forEach((e,i,a) => {
			if(e.in){
				this.edges.push(e);
			}else
				this.vertices.push(e);
			
		})
	}
	

	// convert to d3js
	
}

class D3Grapher extends Grapher
{
	convert(){
	/*
		For each raw element,
		if an vertex, 
	*/
	
	}
} 

module.exports = D3Grapher;