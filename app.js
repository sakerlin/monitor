var express = require('express');
var app     = express();
var hbs = require('hbs');
var fs = require('fs');
var jpp =  require('json-path-processor');

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
var cp = require('child_process');

app.set('views', __dirname + "/views" );
app.use(express.static(__dirname + '/public'));
// ROUTES
// get an instance of router
var router = express.Router();

router.get('/', function(req, res) {
    var adata = {title : 'aaaaaa'};
    res.render('index.html', adata);
});
// apply the routes to our application
app.use('/', router);

var server = app.listen(2013, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});
