require('dotenv').config();
const request = require('supertest')(`http://localhost:${process.env.API_PORT}`);
const assert = require('chai').assert;
const faker = require('faker');
const bcrypt = require('bcryptjs');

describe('Register user and login properly', () => {
  const user = {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  let token;

  step('POST /register', async () => {
    return request
      .post('/register')
      .send(user)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((res, err) => {
        if (err) throw err;

        assert.hasAnyKeys(res.body, [
          'first_name', 'last_name', 'email', 'password',
          'token', '_id',
        ]);
        assert.equal(res.body.first_name, user.first_name)
        assert.equal(res.body.last_name, user.last_name)
        assert.equal(res.body.email, user.email.toLowerCase())
        bcrypt.compare(user.password, res.body.password, (err, result) => {
          if (err) throw err;
          assert.isTrue(result);
        });

        token = res.body.token;
      })
      .catch((err) => {
        throw err;
      });
  });

  step('POST /login', async () => {
    return request
    .post('/login')
    .send({
      email: user.email.toLowerCase(),
      password: user.password,
    })
    .set('Accept', 'application/json')
    // .expect('Content-Type', /json/)
    .expect(200)
    .then((res, err) => {
      if (err) throw err;

      assert.hasAnyKeys(res.body, [
        'first_name', 'last_name', 'email', 'password',
        'token', '_id',
      ]);
      assert.equal(res.body.first_name, user.first_name)
      assert.equal(res.body.last_name, user.last_name)
      assert.equal(res.body.email, user.email.toLowerCase())
      bcrypt.compare(user.password, res.body.password, (err, result) => {
        if (err) throw err;
        assert.isTrue(result);
      })
    })
    .catch((err) => {
      throw err;
    });
  });
  
  step('POST /welcome', () => {
    return request
      .post('/welcome')
      .set('x-access-token', token)
      .expect(200)
      .expect((res, err) => {
        if (err) throw err;
      })
      .catch((err) => {
        throw err;
      });
  })
});