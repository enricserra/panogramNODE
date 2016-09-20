var express = require('express')
var app = express();

var configure_app = function(app) {
    app.set('view engine', 'ejs')
    app.set('./views/')
    app.use(express.static(process.env.PWD + '/public'))
    app.engine('ejs', require('ejs-locals'));
}

configure_app(app);
require('./app/routes.js')(app);
app.listen(8999, function () {

    console.log('Node Server launched, listening on port 8999')

});

