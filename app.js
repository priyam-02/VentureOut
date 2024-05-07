const express = require('express');
const mongoose = require('mongoose'); 
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const userModel = require('./models/user'); 

// MongoDB Atlas Connection URI
const dbURI = 'mongodb+srv://demo:demo123@cluster0.uld0fmj.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    //start app
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
        console.log('Connected to MongoDB Atlas');
    });
})  
.catch((err) => console.log(err));

//create app
const app = express();

//configure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);



app.use(
    session({
        secret: "mySecretKey",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb+srv://demo:demo123@cluster0.uld0fmj.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0'}),
        cookie: {maxAge: 60*60*1000}
        })
);

app.use(flash());


app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});


//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true})); 
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


app.use(async (req, res, next) => {
    if (req.session.user) {
        try {
            const user = await userModel.findById(req.session.user).lean();
            res.locals.user = user; // Now the complete user object is available
            
        } catch (error) {
            console.log(error);
            next(error);
        }
    } else {
        res.locals.user = null;
    }
    next();
});


app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);


app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = 'Internal Server Error';
    }
    res.status(err.status);
    res.render('error', {error: err});
});



module.exports = app;
