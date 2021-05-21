const express = require('express'); //requerir express
//ejecutamos express
const app = express();

const { config } = require('./config/index'); //variables de entorno
const authApi = require('./routes/auth');
const moviesApi = require('./routes/movies.js');
const userMoviesApi = require('./routes/userMovies.js');

//middleware de manejo de error
const {
  logErrors,
  errorHandler,
  wrapErrors,
} = require('./utils/middleware/errorHandlers');

const notFoundHandler = require('./utils/middleware/notFoundHandler');

//body parser
app.use(express.json());

//routes - las routes tambien son middlewares por que tienen (req, res, next)
authApi(app);
moviesApi(app);
userMoviesApi(app);

//Catch 404
app.use(notFoundHandler);

//Errors middleware - siempre van al final de las routes
app.use(logErrors);
app.use(wrapErrors);
app.use(errorHandler);

app.listen(config.port, function () {
  console.log(`Listenig http://localhost:${config.port}`);
});
