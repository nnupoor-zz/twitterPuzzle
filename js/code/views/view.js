var myApp = Backbone.View.extend({
	el : 'body',
	events : {
		"click #3d" : "render",
		"click #d3" : "render"
	},
	initialize : function(){
		//create a time stamp and set match it with localStorage 
		//if time difference >10 min, initialize view to make API call,
		//else use the old data.
		var self=this;
		var curentTime = new Date();
		var time = curentTime.toString();
		var isItRepeated = isRepeated(time);
		console.log('isItCached : '+isItRepeated);
		if(isItRepeated)
		{
		    var str = localStorage.getItem('dataArray');
			var data = JSON.parse(str);
			self.renderCss3D(data);
		}
		else
		{
			//get data from localStorage
			var time = new Date();
			localStorage.setItem('time',time);
			getTwitterData(self,'3d');
		}
	},
	render : function(e){
		var id = e.currentTarget.id;
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
			id==='3d'?self.renderCss3D(data):self.renderGraphD3(data);
			
		}
	},
	renderCss3D : function(data){
		    document.getElementById('container').innerHTML='';
			var d = data, table = [];
			_.each(d, function(n,i){
				if(i===0){table.push(''); table.push(n.imgUrl); table.push(6); table.push(1);}
				else{table.push(i); table.push(n.imgUrl); table.push(i+1); table.push(2);}
			});
		
			init(table);
			animate();
	},
	renderGraphD3 : function(data){
		// var list = "<% _.each(array, function(d,i) { %> <li><%= i+1 %><img src='<%= d.imgUrl %>'></li> <% }); %>";
  //       var li =  _.template(list, {array:data});
		// this.el.innerHTML = li;
		document.getElementById('container').innerHTML='';
		var links = [{"source": 1,"target": 0},{"source": 10,"target": 0},{"source": 1, "target": 0},{"source": 6,"target": 0},{"source": 3,"target": 0},{"source": 8,"target": 0},{"source": 5,"target": 0},{"source": 9,"target": 0},{"source": 7,"target": 0},{"source": 2,"target": 0},{"source": 4,"target": 0},{"source": 0, "target": 0}];
		var json = {links:links,nodes:data};
		renderFDGraph(json);
    }
});