var myApp = Backbone.View.extend({
	el : '#container',
	tagName : 'li',
	className : 'list-menu-item',

	initialize : function(){
		var self=this;
		$.getJSON('/testUser/twitterAPI.php?url='+encodeURIComponent('statuses/user_timeline.json?screen_name=github&count=15'), function(d){
		//get the 15 tweets.(used hint to assume count.)
		   var data=d;
		   for(var i=0,l=data.length,max=0;i<l;i++)
		   {
		   	var twtrDate = data[i].created_at, 
		   	    istDate = new Date(twtrDate.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/,"$1 $2 $4 $3 UTC")), 
		   	    day = Number(istDate.toString().substring(8,10)); 
		   	//take max no of tweets in the given week(hinted tweet's date.)

		   	if(day>19 && day<=25)
		   	{
		   		if(max<data[i].retweet_count)
		   		{
		   			id = data[i].id_str;
		   			max = data[i].retweet_count;
		   			console.log(max,data[i].retweet_count,i,day);
		   		} 
		   	}
		   	
		   }
		   console.log(data);
		   //based on the id of max retweeted tweet,fetch all retweeters count and push followercount and image in an array.
		  $.getJSON('/testUser/twitterAPI.php?url='+encodeURIComponent('statuses/retweets/'+id.toString()+'.json?count=10'), function(d){
		  		var userData = d, myArray = [];
		  		for(var ii=0,l=userData.length;ii<l;ii++)
		  		{
		  			var obj={}; obj.followerCount = userData[ii].user.followers_count; obj.imgUrl = userData[ii].user.profile_image_url;
		  			myArray.push(obj);
		  		}
		  		//sort in decreasing order of follwerCount
		  		myArray.sort(function(a, b) {
				   return b.followerCount - a.followerCount;
				});
		  		//render the view.
				self.render(myArray);
				  		
		    });
		  });
	},
	render : function(data){
		var list = "<% _.each(array, function(d,i) { %> <li><%= i+1 %><img src='<%= d.imgUrl %>'></li> <% }); %>";
        var li =  _.template(list, {array:data});
		this.el.innerHTML = li;
	}
});