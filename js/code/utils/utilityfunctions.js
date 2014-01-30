var isRepeated = function(time){
	var loggedTime = localStorage.getItem('time');
	var setTime = Number(loggedTime);
	var currentTime = Date.parse(time);
	var timeDifference = (((currentTime-setTime)/1000)/60);
	if(loggedTime!==null&&timeDifference<20&&localStorage.getItem('dataArray')!==null){return true;}
	else{return false;}
}

var K = function () {
    var a = navigator.userAgent;
    return {
        ie: a.match(/MSIE\s([^;]*)/)
    }
}();
 
var H = function (a) {
    var b = new Date();
    var c = new Date(a);
    if (K.ie) {
        c = Date.parse(a.replace(/( \+)/, ' UTC$1'))
    }
    var d = b - c;
    var e = 1000,
        minute = e * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;
    if (isNaN(d) || d < 0) {
        return ""
    }
    if (d < day) {
        return Math.floor(d / hour) + " hours ago"
    }
    if (d > day && d < day * 2) {
        return "yesterday"
    }
    if (d < day * 365) {
        return Math.floor(d / day) + " days ago"
    } else {
        return "over a year ago"
    }
};


function makeAPICall(tweetIdArray,callback){
	var RTCountArray=[]; var count = Math.ceil(10/tweetIdArray.length);
	for(var j=0,len=tweetIdArray.length;j<len;j++){
	 $.getJSON('/testUser/twitterAPI.php?url='+encodeURIComponent('statuses/retweets/'+tweetIdArray[j].toString()+'.json?count=10'), function(d){
	   		 	var userData = d, myArray = []; 
		  		for(var ii=0,l=userData.length;ii<l;ii++)
		  		{
		  			var obj={}; obj.followerCount = userData[ii].user.followers_count; obj.imgUrl = userData[ii].user.profile_image_url;
		  			myArray.push(obj);
		  		}
		  		//sort in increasing order of follwerCount
		  		myArray.sort(function(a, b) {
				   return b.followerCount - a.followerCount;
				});
				console.log(myArray);
				var array = myArray.slice(0,count);
				console.log(array);
				RTCountArray.push(array);
				
				if(RTCountArray.length===tweetIdArray.length)
				{
					var userArray = _.flatten(RTCountArray[0]);
					callback(userArray);
				}
		});	
	}
}
 
var getTwitterData = function(self,elid){
	var elid = elid;
	$.getJSON('/testUser/twitterAPI.php?url='+encodeURIComponent('statuses/user_timeline.json?screen_name=dhh&count=15'), function(d){
		//get the 15 tweets.(used hint to assume count.)
	   var data=d, handleImg = data[0].user.profile_image_url, tweetArray=[], tweetIdArray=[];
	   
	   for(var i=0,l=data.length,max=0;i<l;i++)
	   {
	   	var createDate = H(data[i].created_at); 
	   	//console.log(createDate);
	   	if(createDate!=='yesterday' && createDate!=='over a year ago' && data[i].in_reply_to_screen_name===null && data[i].retweeted_status===undefined)
	   	{
	   		//tweetArray.push(data[i]);
	   		tweetIdArray.push(data[i].id_str);
	   	}
	   }
	    console.log(tweetIdArray);
	   //based on the id of max retweeted tweet,fetch all retweeters count and push followercount and image in an array.
	    makeAPICall(tweetIdArray,function(userArray){
	    	_.first(userArray,10);
	  		//push the github image and set the data in LS
	  		userArray.unshift({followerCount:'',imgUrl:handleImg});
	  		console.log(userArray);
	  		var arr = JSON.stringify(userArray);
	  		localStorage.setItem('dataArray',arr);
	  		//render 
	  		(elid==='3d')?self.renderCss3D(userArray):self.renderGraphD3(userArray); 		
	    });
	 });
}

var renderFDGraph = function(json){
	var div = d3.select("body").append("div")   
    .attr("class", "newtooltip")               
    .style("opacity", 0);

var width = 1000,
    height = 600;

var svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .gravity(.05)
    .distance(180)
    .charge(-800)
    .friction(0.45)
    .linkStrength(1)
    .size([width, height]);

  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg.selectAll(".link")
      .data(json.links)
      .enter().append("line")
      .attr("class", "link");

  var node = svg.selectAll(".node")
      .data(json.nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  node.append("image")
      .attr("xlink:href", function(d){return d.imgUrl;})
      .attr("x", -20)
      .attr("y", -25)
      .attr("width", 40)
      .attr("class", "circular")
      .attr("height", 40)
      .on("mouseover", function(d,i) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html( i )  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}

//3d Render
//GLOBAL VARIABLES
var camera, scene, renderer, controls;
	function init(table) {
		console.log(table);
		var objects = [];
		var targets = { table: [], sphere: [], helix: [], grid: [] };
		camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 3000;

		scene = new THREE.Scene();

		// table

		for ( var i = 0; i < table.length; i += 4 ) {

			var element = document.createElement( 'div' );
			element.className = 'element';
			element.style.backgroundImage = "url('"+table[ i+1 ]+"')";
			element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

			var number = document.createElement( 'div' );
			number.className = 'number';
			number.textContent = table[i] ;
			element.appendChild( number );

			var symbol = document.createElement( 'div' );
			symbol.className = 'symbol';
			symbol.style.backgroundImage = "url('"+table[ i+1 ]+"')";
			element.appendChild( symbol );

			var object = new THREE.CSS3DObject( element );
			object.position.x = Math.random() * 4000 - 2000;
			object.position.y = Math.random() * 4000 - 2000;
			object.position.z = Math.random() * 4000 - 2000;
			scene.add( object );

			objects.push( object );

			var object = new THREE.Object3D();
			object.position.x = ( table[ i + 2 ] * 260 ) - 1630;
			object.position.y = - ( table[ i + 3 ] * 260 ) + 590;

			targets.table.push( object );

		}

		
		renderer = new THREE.CSS3DRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.domElement.style.position = 'absolute';
		document.getElementById( 'container' ).appendChild( renderer.domElement );

		controls = new THREE.TrackballControls( camera, renderer.domElement );
		controls.rotateSpeed = 0.5;
		controls.minDistance = 500;
		controls.maxDistance = 6000;
		controls.addEventListener( 'change', render );


		transform( targets.table, 5000, objects);
		//

		window.addEventListener( 'resize', onWindowResize, false );

	}

	function transform( targets, duration, objects) {

		TWEEN.removeAll();

		for ( var i = 0; i < objects.length; i ++ ) {

			var object = objects[ i ];
			var target = targets[ i ];

			new TWEEN.Tween( object.position )
				.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
				.easing( TWEEN.Easing.Exponential.InOut )
				.start();

			new TWEEN.Tween( object.rotation )
				.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
				.easing( TWEEN.Easing.Exponential.InOut )
				.start();

		}

		new TWEEN.Tween( this )
			.to( {}, duration * 2 )
			.onUpdate( render )
			.start();

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		render();

	}

	function animate() {

		requestAnimationFrame( animate );

		TWEEN.update();

		controls.update();

	}

	function render() {

		renderer.render( scene, camera );

	}