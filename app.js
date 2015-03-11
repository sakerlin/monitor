var express = require('express');
var app     = express();
var hbs = require('hbs');
var fs = require('fs');
var jpp =  require('json-path-processor');
var mongoskin = require('mongoskin');
var bodyParser = require('body-parser');
var logger = require('morgan');
/*
var mongodb = require("mongodb"); 
var mongodbServer = new mongodb.Server("localhost", 27017, {  
    auto_reconnect: true,
    poolSize: 10
});

var db = new mongodb.Db("mydatabase", mongodbServer);
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));
var db = mongoskin.db('mongodb://127.0.0.1:27017/test', {safe:true})
// Config

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
var cp = require('child_process');

app.set('views', __dirname + "/views" );
app.use(express.static(__dirname + '/public'));
// ROUTES
// get an instance of router
var router = express.Router();


router.param('collectionName', function(req, res, next, collectionName){
  console.log('collectionName = ' + collectionName);  
  req.collection = db.collection(collectionName);
  return next()
});

router.get('/', function(req, res) {
    console.log('index');
    var adata = {title : 'aaaaaa'};
    res.render('index.html', adata);
});

router.get('/api/:collectionName', function(req, res, next) {
   console.log('list');
    req.collection.find({} ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
    if (e) return next(e)
    res.send(results)
  })
});

router.post('/api/:collectionName', function(req, res, next) {
   console.log('insert');
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e)
    res.send(results)
  })
});

router.get('/api/:collectionName/:id', function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send(result)
  })
});

router.put('/api/:collectionName/:id', function(req, res, next) {
  req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    if (e) return next(e)
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
});
/*
router.del('/api/:collectionName/:id', function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
})
*/


// apply the routes to our application
app.use('/', router);

var server = app.listen(2013, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('FE monitor app listening at http://%s:%s', host, port)

});
