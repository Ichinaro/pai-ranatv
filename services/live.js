const MongoLib = require('../lib/mongo');

class MoviesService {
  constructor() {
    this.collection = 'live';
    this.mongoDB = new MongoLib();
  }

  async getLives({ tags }) {
    const query = tags && { tags: { $in: tags } };
    const movie = await this.mongoDB.getAll(this.collection, query);
    return movie || {};
  }

  async createLive({ movie }) {
    const createMovieId = await this.mongoDB.create(this.collection, movie);
    return createMovieId;
  }

  async deleteLive({ streamingId }) {
    const deletedMovieId = await this.mongoDB.delete(
      this.collection,
      streamingId
    );
    return deletedMovieId;
  }
}

module.exports = MoviesService;
