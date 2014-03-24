/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , request = require('request')
  , cheerio = require('cheerio')
  , url = require('url')

var app = express()
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/templates')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))


// Routes

app.get('/', function(req, res){
  //Tell the request that we want to fetch youtube.com, send the results to a callback function
      request({uri: 'https://www.boston.com/bigpicture/'}, function(err, response, body){
              var self = this;
    self.items = new Array();//I feel like I want to save my results in an array
    //Just a basic error check
                if(err && response.statusCode !== 200){console.log('Request error.');}


    //Use jQuery just as in any regular HTML page
      var $ = cheerio.load(body)
      , $body = $('body')
      , $headlines = $body.find('.headDiv2');
    //for each one of those elements found
        $headlines.each(function(i, item){
      //I will use regular jQuery selectors
      var $a = $(item).find('a'),
          $title = $(item).find('h2 a').text(),
          $count = $(item).find('.bpBody a').text(),
          $img = $(item).find('.bpImageTop img');


      //and add all that data to my items array
        self.items[i] = {
        title: $title.trim(),
        count: $count.trim(),
        thumbnail: $img.attr('src'),
        urlObj: url.parse($a.attr('href'), true)//parse our URL and the query string as well
      };
                      });
      console.log(self.items);
    //We have all we came for, now let's build our views
    res.render('list', {
      title: 'NodeTube',
      items: self.items
                      });
              });
});
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});