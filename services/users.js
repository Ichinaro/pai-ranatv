const MongoLib = require('../lib/mongo');
const bcrypt = require('bcrypt');

class UsersService {
  constructor() {
    this.collection = 'users';
    this.mongoDB = new MongoLib();
  }

  async getUser({ email }) {
    const [user] = await this.mongoDB.getAll(this.collection, { email }); //al colocar [user] el objeto al que corresponda el email de todo el arreglo
    return user; //retorna los datos de solo 1 user
  }
  async createUser({ user }) {
    const { name, email, password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createUserId = await this.mongoDB.create(this.collection, {
      name,
      email,
      password: hashedPassword,
    });

    return createUserId;
  }
  async verifyUserExists({ email }) {
    const [user] = await this.mongoDB.getAll(this.collection, { email });
    return user;
  }
}

module.exports = UsersService;
