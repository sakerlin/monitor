var express = require('express');
var app     = express();
var hbs = require('hbs');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
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
    res.render('vd.html');
});
router.get('/module/:mid', function(req, res) {
    console.log('about page');
    var mid = req.params.mid,  //module id
        registerPartialDir = function (partialsDir){
            var filenames = fs.readdirSync(partialsDir);
            filenames.forEach(function (filename) {
              var matches = /^([^.]+).hb.html$/.exec(filename);
              if (!matches) {
                return;
              }
              //var name = matches[1];
              var name = filename.substr(0,filename.length-5);
              console.log('name='+name);
              var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
              hbs.registerPartial(name, template);
            });
        },
        copyStaticFile = function (elms){

            elms.forEach(function (elm){
                var filename = elm.replace("./catalog", "");
                console.log
                console.log('cp ' + __dirname + filename + ' ' + __dirname + '/public/static');
                cp.exec('cp ' + __dirname + filename + ' ' + __dirname + '/public/static/');
            });
        }; 
    //get mockdata
    var adata = [];
    try {
        adata = fs.readFileSync('module/' + mid + '/dataObject/' + mid + '.json', 'utf8', function (err,data){
            if (err) {
                return {};
            }
            return data;
        });
        adata = JSON.parse(adata);
    } catch (e){

    };
    //get fuse setting
    var fuse = fs.readFileSync(__dirname + '/module/fuse.catalog.xml', 'utf8', function (err,data){
    });
    console.log(fuse);
    
    var css = [], js = [], cssfiles = [], jsfiles = [];
    parser.parseString(fuse, function (err, result) {
        var files = jpp(result).each('fuse.module', function (V) {
           if(V.$.id === 'catalog.' + mid){
                jpp(V.file).each('$',function (f){
                    if(f.$.type === 'js'){
                        js.push(f.$.src);
                        var res = f.$.src.split("/");
                        jsfiles.push(res[res.length-1]);
                    };
                    if(f.$.type === 'css'){
                        css.push(f.$.src);
                        var res = f.$.src.split("/");
                        cssfiles.push(res[res.length-1]);

                    };
                });
            };
        });
    });
    console.log(css);
    console.log(js);
    copyStaticFile(css);
    copyStaticFile(js);

    hbs.registerPartial('cssfile.hb', __dirname + '/views/partial/cssfile.html');
    hbs.registerPartial('jsfile.hb', __dirname + '/views/partial/jsfile.html');
    
    //registerPartial
    var partialsDir = __dirname + '/module/' + mid + '/views';
    registerPartialDir(partialsDir);
    var staticPartialsDir = __dirname + '/views/partial';
    registerPartialDir(staticPartialsDir);
    
    //page tpl
    var tpl = fs.readFileSync(__dirname + '/views/tpl.html', 'utf8', function (err,data){
        if (err) {
            return console.log(err);
        }
        return data;
    });
    tpl = tpl.replace("#moduleid#", mid);
    fs.writeFileSync(__dirname + '/views/tpl2.html', tpl, 'utf8', function(err){
        if(err) throw err;
        console.log('tpl.html update');
    });

    adata.css = cssfiles;
    adata.js = jsfiles;
    res.render('tpl2.html', adata);
    //res.render(mid + '/views/' + mid + '.hb.html', adata);
});

// apply the routes to our application
app.use('/', router);

var server = app.listen(3013, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});
