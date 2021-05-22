const express = require('express');
const passport = require('passport');
const MoviesService = require('../services/movies');
const LiveService = require('../services/live');

const {
  movieIdSchema,
  createMovieSchema,
  updateMovieSchema,
} = require('../utils/schemas/movies');

const validationHandler = require('../utils/middleware/validationHandler');

const cacheResponse = require('../utils/cacheResponse');
const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS,
} = require('../utils/time');

//JWT STRATEGY
require('../utils/auth/strategies/jwt'); // retorna ...user con los scopes

function moviesApi(app) {
  const router = express.Router();
  app.use('/api/movies', router);

  const moviesService = new MoviesService();
  const streamingService = new LiveService();

  router.get(
    '/',
    //passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      cacheResponse(res, FIVE_MINUTES_IN_SECONDS); //tiene menos tiempo por que es mas probable que se agregen peliculas a que se editen
      const { tags } = req.query;

      try {
        const movies = await moviesService.getMovies({ tags });
        res.status(200).json({
          data: movies,
          message: 'movies listed',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.get(
    '/stream',
    //passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      //cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
      const { tags } = req.query;
      try {
        console.log('llamado liveservice');
        const live = await streamingService.getLives({ tags });

        res.status(200).json({
          data: live,
          message: 'lives streaming',
        });
      } catch (err) {
        console.log('fallo de:', err);
        next(err);
      }
    }
  );

  router.delete(
    '/stream/:streamingId',
    passport.authenticate('jwt', { session: false }),
    //validationHandler({ movieId: movieIdSchema }, 'params'),
    async function (req, res, next) {
      const { streamingId } = req.params;
      try {
        console.log('llamado liveservice delete');
        const live = await streamingService.deleteLive({ streamingId });

        res.status(200).json({
          data: live,
          message: 'movie deleted',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    '/stream/create',
    passport.authenticate('jwt', { session: false }),
    //validationHandler(createMovieSchema),
    async function (req, res, next) {
      const { body: movie } = req;
      try {
        console.log('llamado streaming create');
        const createdMovieId = await streamingService.createLive({ movie });
        res.status(201).json({
          data: createdMovieId,
          message: 'Live created',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  //validationHandler compara el esquema de movieId con el parametro
  router.get(
    '/:movieId',
    passport.authenticate('jwt', { session: false }),
    validationHandler({ movieId: movieIdSchema }, 'params'),
    async function (req, res, next) {
      cacheResponse(res, SIXTY_MINUTES_IN_SECONDS); //tiene mas tiempo que es menos probable que editen una pelicula, en este caso la solicitada
      const { movieId } = req.params;

      try {
        const movies = await moviesService.getMovie({ movieId });

        res.status(200).json({
          data: movies,
          message: 'movie retrieved',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  //validationHandler compara el esquema createMovieSchema con el body (por defecto)
  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    //validationHandler(createMovieSchema),
    async function (req, res, next) {
      const { body: movie } = req;
      try {
        console.log('llamado route delete');
        const createdMovieId = await moviesService.createMovie({ movie });
        res.status(201).json({
          data: createdMovieId,
          message: 'movie created',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    '/:movieId',
    passport.authenticate('jwt', { session: false }),
    validationHandler({ movieId: movieIdSchema }, 'params'),
    validationHandler(updateMovieSchema),
    async function (req, res, next) {
      const { movieId } = req.params;
      const { body: movie } = req;

      try {
        const updatedMovieId = await moviesService.updateMovie({
          movieId,
          movie,
        });

        res.status(200).json({
          data: updatedMovieId,
          message: 'movie updated',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    '/:movieId',
    passport.authenticate('jwt', { session: false }),
    validationHandler({ movieId: movieIdSchema }, 'params'),
    async function (req, res, next) {
      const { movieId } = req.params;

      try {
        console.log('llamado route delete');
        const deletedMovieId = await moviesService.deleteMovie({ movieId });

        res.status(200).json({
          data: deletedMovieId,
          message: 'movie deleted',
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = moviesApi;

// los controlladores = es toda la capa del middlewares, y del router (get,post,put,ect)comunicación con api donde se recibe y se envía JSON
//los controlladores solo llaman servicios, pero los servicios si llaman a otros servicios y librerías bases de datos u otras apis
//La unica responsabilidad de la rutas en como recibir parametros y como se los envia a los servicios
