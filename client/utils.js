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

exports.AttrWrapper = AttrWrapper;
exports.XForm = XForm;