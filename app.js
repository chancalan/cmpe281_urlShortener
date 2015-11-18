var fs = require('fs');
var express = require('express');
var Client = require('node-rest-client').Client;
var request = require('request');
var http = require('http');
var S = require('string');

var app = express();
app.use(express.bodyParser());
app.use("/images", express.static(__dirname + '/images'));

var endpoint = "http://52.11.127.220"


var page = function( req, res, state ) {
    var body = fs.readFileSync('./urlShortener.html');
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    
    var msg = "This is the current state of this app: " + state + "<br>";
    if (state == "has-url"){
        var longurl = req.body.longurl;
        if ( ! (S(longurl).startsWith("http://") || S(longurl).startsWith("https://"))){
            longurl = "http://" + longurl;
        }
        var shorturl;
        getShortUrl(longurl, function(shorturl){
        msg = msg + "Your Long URL: " + longurl + "<br>";
        msg = msg + "Your Short URL: " + shorturl + "<br>";
        var html_body = "" + body;
        html_body = html_body.replace("{message}", msg);
        res.end(html_body);
        });
    }else {
        var html_body = "" + body;
        html_body = html_body.replace("{message}", msg);
        res.end(html_body);
    }
}

var getShortUrl = function( longurl, callback) {
    request({
        url : endpoint,
        method : "POST",
        json: true,
        body : {
            "longurl" : longurl
        }
    }, function(error, response, body){
        if(error){
            console.log(error);
            callback(null);
        } else {
            console.log(response.statusCode, body);
            callback(body.shorturl);
        }
    }
    )
}

var handle_post = function (req, res) {
    console.log( "Post: " + "Submitted URL: " +  req.body.longurl + "\n" ) ;
    var longurl = "" + req.body.longurl ;
    //NEED TO VALIDATE LONG URL
    if ( ! (S(longurl).startsWith("http://") || S(longurl).startsWith("https://"))){
        longurl = "http://" + longurl;
    }
    console.log("longurl: "+longurl);

    if (longurl.trim() == "") {
        page( req, res, "no-url" ) ;
    }
    else{
        page(req, res, "has-url") ;
    }
}

var handle_get = function (req, res) {
    console.log( "Get: ..." ) ;
    page( req, res, "no-url" ) ;
    
}

app.set('port', (process.env.PORT || 5000));

app.post("*", handle_post );
app.get( "*", handle_get ) ;

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
