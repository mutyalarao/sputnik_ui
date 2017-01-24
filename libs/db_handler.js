'use strict'; 

var OrientDB = require('orientjs');

// server --> database


class dbEngine{
	
	constructor() {
		this.conn = {};
		this.server = {};
	}
	
	setConn(conn) {
		this.conn = conn;
	}
	
	connectServer(){		
		this.server = OrientDB(this.conn)
	}
	
	disconnectServer(){
		
		
	}
	
	openDB(dbName,uName,pwd){
		
		
		var db = this.server.use({
			name : dbName,
			username : uName,
			password : pwd
		});
		
		console.log('using db ', db)
		this.addDB(dbName,db);
		
		
	}
	
	getClassListPr(dbName) {
		return this.getDB(dbName).class.list();
		
	}
	
	addDB(dbName,dbObj){
		if(!this.dbMap) this.dbMap = new Map();
		this.dbMap.set(dbName,dbObj);	
	}
	
	getDB(dbName){
		return this.dbMap.get(dbName);
	}
	
	closeDB(dbName){
		this.dbMap.delete(dbName)
	}
	
	getClassPr(dbName, className){
		//returns Promise
		return this.getDB(dbName).class.get(className);
	}
	
	getVertexMap(vClass, vName, depth){
		
		var sql = 'select * from '  + vClass + 'where ' ;
		//return this.getDB(dbName).
	}
	getClassPropsPr(dbName,className){
		return new Promise((resolve,reject) => {
			this.getDB(dbName).class.get(className)
			.then(classObj =>{
				console.log("classObj success..",classObj.name)
				
				classObj.property.list()
				.then(vals => {
					var propList = [];
					vals.forEach((e,i,a) => {
						propList.push({
							name : e.name
							,type : e.type
						})
					});
					resolve(propList);
				})
				.catch(e => {reject(e);})
				
				
			})
			.catch(e => {
				reject(e);
			})
			
		});
		
	}
	

	
	getByRid_Pr(dbName, rid){
		
		return this.getDB(dbName).record.get(rid);
		
	}
	
	execQueryPr(dbName, sql,params,limit){
		// returns a promise
		var _params = params;
		//_params.limit = limit;
		sql += ` LIMIT ${limit} `
		return this.getDB(dbName).exec(sql,_params)
		
	}
	
	execQuery2Pr(dbName, sql, params, limit){
		var _params = params;
		_params.limit = limit;
		return this.getDB(dbName).query(sql, _params);
		
	}
	

}

module.exports = dbEngine;

