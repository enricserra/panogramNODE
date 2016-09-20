module.exports = function(app) {
    app.get( '/panogram' , function (req, res) {
        res.render( 'panogram.ejs' );
    });
}

