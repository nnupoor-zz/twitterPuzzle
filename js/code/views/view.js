var myApp = Backbone.View.extend({
	el : 'body',
	events : {
		"click #3d" : "render",
		"click #d3" : "render"
	},
	initialize : function(){
		this.render();
	},
	render : function(e){
		//create a time stamp and set match it with localStorage 
		//if time difference >20 min, initialize view to make API call,
		//else use the old data.
		var id = (e!==undefined)?e.currentTarget.id:'3d';
		var self=this;
		var curentTime = new Date();
		var isItRepeated = isRepeated(curentTime);
		if(!isItRepeated)
		{
			localStorage.setItem('time', +new Date);
			getTwitterData(self,id);
		}
		else
		{
			//get data from localStorage
			var str = localStorage.getItem('dataArray');
			var data = JSON.parse(str);
			id==='d3'?self.renderGraphD3(data):self.renderCss3D(data);
		}
	},
	renderCss3D : function(data){
		    document.getElementById('container').innerHTML='';
			var d = data, table = [];
			_.each(d, function(n,i){
				if(i===0){table.push(''); table.push(n.imgUrl); table.push([d.length/2]); table.push(1);}
				else{table.push(i); table.push(n.imgUrl); table.push(i+1); table.push(2);}
			});
		
			init(table);
			animate();
	},
	renderGraphD3 : function(data){
		document.getElementById('container').innerHTML='';
		console.log(data.length);
		if(data.length===11){
				var links = [{"source": 0,"target": 0},{"source": 1,"target": 0},{"source": 2, "target": 0},{"source": 3,"target": 0},{"source": 4,"target": 0},{"source": 5,"target": 0},{"source": 6,"target": 0},{"source": 7,"target": 0},{"source": 8,"target": 0},{"source": 9,"target": 0},{"source": 10,"target": 0}];	
		}else{
				var l = [{"source": 0,"target": 0},{"source": 1,"target": 0},{"source": 2, "target": 0},{"source": 3,"target": 0},{"source": 4,"target": 0},{"source": 5,"target": 0},{"source": 6,"target": 0},{"source": 7,"target": 0},{"source": 8,"target": 0},{"source": 9,"target": 0}];				
				var links = _.first(l,data.length);
		}
		var json = {links:links,nodes:data};
		renderFDGraph(json);
    }
});