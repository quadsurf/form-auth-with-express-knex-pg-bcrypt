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

4. Start the app:

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

## Unique User Salts
Notice how each user gets a random salt. This technique is used to enhance security.

```table
   id |         email         |                           password                           |             salt
  ----+-----------------------+--------------------------------------------------------------+-------------------------------
    1 | fabiodev@example.com  | $2a$10$L6EfCE8BC2Ub30fVBh4/S.qQmIt8CwcHvGUcEeyWAErbMysPLdHIK | $2a$10$L6EfCE8BC2Ub30fVBh4/S.
    2 | fabiodev1@example.com | $2a$10$8/ulU4P/axyZNT8D3.XQbeuhWpC1VRRwNvNNs0u7za2Ed4fPhxTz6 | $2a$10$8/ulU4P/axyZNT8D3.XQbe
    3 | fabiodev3@example.com | $2a$10$Uxxt6KwFl5aJSdC0XvTxXeNp3keD3JjR55Vt/3.bLSFrNNHZoLEqa | $2a$10$Uxxt6KwFl5aJSdC0XvTxXe
  (3 rows)
```

# Job Spec / Assignment
Implement the following features:

0. We need `regular` users and `admin` users.
  - Update the `knex > db/migration` to include a column called `admin`, which is a boolean and defaults to `false`.
  - The `signup` view needs to have an radio input for selecting if the user signing up is an admin or not, it should default to `false`.
1. Only logged in users of type `admin` are allowed to list all users. [Route `/users`] this route should return as `json`.
2. A logged in `regular` user can only request their own user id. [Route `/users/:id`] this route should return as `json`.
  - If they try to request another user's id, they should be informed they are not an `admin` and this route should return as `json`.
3. An `admin` user can delete a user [Route `/users/:id`]
  - Create a `delete` route for `admin` and this route should return as `json`.
  - `admin` view in `loggedin`: For admins only, the `loggedin` view will list all users in the `users` table in the view. Each row should have a delete button for removing that specific user.
  - An `admin` can only delete `regular` users. An `admin` cannot delete another `admin`.
4. Create a `knex` migration to seed your database with 100 random users of type `admin` and `regular`.
