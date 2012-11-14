var fs = require('fs');
var url=require('url');
var path    =   require('path');
var server = require('http').createServer(function (req, res) {

    var pathname = url.parse(req.url).pathname;
    var ext      = path.extname(pathname).toLowerCase();

    console.log(pathname+":"+ext.length);
     if(ext.length==0)
     {

        fs.readFile('./newnowclient.html', 'utf-8', function(error, content) {
            res.writeHead(200, {'Content-Type' : 'text/html'});
            res.end(content);
        });
    }
    else if(ext===".css"){
    	console.log("done!!!! css:"+pathname+"\n");
        fs.readFile( __dirname + pathname,function(err,data){
	  	if(err){
	  		console.log(err);
	  		res.writeHead(500);
	  		return res.end('error in loading...');
	   	}

        
	   	res.writeHead(200, {'Content-Type' : 'text/css'});
	   	res.end(data);
	   	console.log(data);
	  });
    }
    else if(ext===".js"){
    	console.log("done!!!! js");
        fs.readFile(__dirname + pathname,function(error, content) {
            res.writeHead(200, {'Content-Type' : 'application/javascript'});
            res.end(content);
        });
    }
    else if(ext===".png"){
    	console.log("done!!!! png");
        fs.readFile( __dirname + pathname,function(err,data){
		  	if(err){
		  		console.log(err);
		  		res.writeHead(500);
		  		return res.end('error in loading...');
		   	}

        
	   	res.writeHead(200, {'Content-Type' : 'image/png'});
	   	res.end(data);
	   	console.log(data);
	  });
    }
    else if(ext===".gif"){
    	console.log("done!!!! png");
        fs.readFile( __dirname + pathname,function(err,data){
		  	if(err){
		  		console.log(err);
		  		res.writeHead(500);
		  		return res.end('error in loading...');
		   	}

        
	   	res.writeHead(200, {'Content-Type' : 'image/gif'});
	   	res.end(data);
	   	console.log(data);
	  });
    }
    
});

server.listen(8080);
var nowjs = require("now");
var everyone = nowjs.initialize(server);

var twitter = require('ntwitter');
var credentials = require('./credentials.js');


var t = new twitter({
    consumer_key: credentials.consumer_key,
    consumer_secret: credentials.consumer_secret,
    access_token_key: credentials.access_token_key,
    access_token_secret: credentials.access_token_secret
});
  


function streamme(room){
  t.stream(
    'statuses/filter',
    { track: room },
    function(stream) {
        stream.on('data', function(data) {
          if(data && data.user.profile_image_url){ 
	           var newRoom=room.join(',');
	           var obj=Object();
	            obj.text=data.text;
	            obj.pic=data.user.profile_image_url;
	            if(data.coordinates && data.coordinates.coordinates){
	            	obj.coordinates=data.coordinates.coordinates;
	             } else if(data.place && data.place.bounding_box){
			      var place = data.place.bounding_box.coordinates[0][0];
			      	obj.coordinates=place;
			     }

			   var tweet=JSON.stringify(obj);
	           nowjs.getGroup(newRoom).now.receiveMessage("chetan", tweet);
         }              
        });
    }
);	
}

nowjs.on("connect", function(){

  this.now.room="love,hate";
  
  nowjs.getGroup(this.now.room).addUser(this.user.clientId);
  var rooms=this.now.room.split(',');
  streamme(rooms);
   
});

nowjs.on("disconnect", function(){

});


everyone.now.distributeMessage = function(message){
	//console.log(message);
  everyone.now.receiveMessage(this.now.name, message);
};


everyone.now.changeRoom = function(newRoom){
  //this.now.distributeMessage("[leaving " + this.now.room + "]");
  nowjs.getGroup(this.now.room).removeUser(this.user.clientId);
  
  
  var rooms=newRoom.split(',');
  this.now.room=newRoom;
  nowjs.getGroup(newRoom).addUser(this.user.clientId);
  streamme(rooms);
  
}