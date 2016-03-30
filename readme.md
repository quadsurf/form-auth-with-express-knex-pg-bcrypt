# Form-based authentication with `express`, `knex`, `postgres`, `bcrypt`

Application Setup
--

To run the app:

  1. Create a `.env` file with a random cookie secret:

  ```sh
  echo SECRET=$(node -e "require('crypto').randomBytes(48, function(ex, buf) { console.log(buf.toString('hex')) });") >> .env
  ```

  2. This secret code is used in `app.js` by the cookie-parser module. Uncomment the following line in `app.js` should be around line 27.

  ```js
  app.use(cookieParser(process.env.SECRET));
  ```

  3. Install `npm` dependencies and create the `psql` database:

  ```sh
  npm install
  createdb galvanize-form-auth-with-express-knex-pg-bcrypt
  ```

  4. Run the `knex` migration (located in the migrations folder) to create the tables on the database:

  ```sh
  knex migrate:latest
  ```

  5. Start the app:

  ```sh
  npm start
  ```

The app is hosted on port 3000: [http://localhost:3000/](http://localhost:3000/)

<hr>

# App Walk-through

## Routes

`app.js` defines the routes in our application.

```js
app.use('/auth', auth);
app.use('/users', users);
```

### Auth

The auth routes file (`./routes/auth.js`) contains the following routes:

```js
POST signup
POST signin
GET logout
```

### Users

The users routes file (`./routes/users.js`) contains the following routes:

```js
GET /users (lists users)
GET /users/:id (gets a single user)
```

<br>

## Bcrypt Hashing & Salt
The modular crypt format for bcrypt consists of

* `$2$`, `$2a$` or `$2y$` identifying the hashing algorithm and format,
* a two digit value denoting the cost parameter, followed by `$`
* a 53 characters long base-64-encoded value (they use the alphabet `.`, `/`, `0`–`9`, `A`–`Z`, `a`–`z` that is different to the [standard Base 64 Encoding](http://tools.ietf.org/html/rfc4648#section-4) alphabet) consisting of:
  * 22 characters of salt (effectively only 128 bits of the 132 decoded bits)
  * 31 characters of encrypted output (effectively only 184 bits of the 186 decoded bits)

Thus the total length is 59 or 60 bytes respectively.

Examples:
```js
let hash = bcrypt.hashSync('password', 10);
 // '$2a$10$VqeqkeCsxlKfRefRSNZXf.WH5o52XyO3f4wZYAuVd8yGSoZamiT9u'

bcrypt.compareSync('password', hash);
 // true

bcrypt.compareSync('wRoNgPaSsWoRd', hash);
 // false
```

The number `10` in the `hashSync` example above referes to the number of cycles used to generate the salt. The larger this number, the longer it takes to create the salt, which in theory makes it more secure.


# Job Spec / Assignment
Implement the following features:

1. We need `regular` users and `admin` users.
  - Update the `knex > db/migration` to include a column called `admin`, which is a boolean and defaults to `false`.
  - The `signup` view needs to have an radio input for selecting if the user signing up is an admin or not, it should default to `false`.
2. Only logged in users of type `admin` are allowed to list all users. [Route `/users`] this route should return as `json`.
3. A logged in `regular` user can only request their own user id. [Route `/users/:id`] this route should return as `json`.
  - If they try to request another user's id, they should be informed they are not an `admin` and this route should return as `json`.
4. An `admin` user can delete a user [Route `/users/:id`]
  - Create a `delete` route for `admin` and this route should return as `json`.
  - `admin` view in `loggedin`: For admins only, the `loggedin` view will list all users in the `users` table in the view. Each row should have a delete button for removing that specific user.
  - An `admin` can only delete `regular` users. An `admin` cannot delete another `admin`.
5. Create a `knex` migration to seed your database with 100 random users of type `admin` and `regular`.
6. Think of this APP as a simple user management APP and `style` it. Make it pretty. 💚  

## Update: Plot Twist:
Oh snap, the last commit was wacky. Issues, with PW salting. Oh no...

  #### Fixes:

    - Route status changes
    - bcrypt pw hashing updated
    - database migration added

Remember to run migrations. Also you're going to have merge conflicts 😄. You need to fix that. Another thing, users in your db probably wont auth anymore so you'll need to delete all rows and re-seed.  
