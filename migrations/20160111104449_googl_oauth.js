
exports.up = function(knex, Promise) {
    return knex.schema.createTable('google_users', function(table) {
      table.increments();
      table.string('accessToken');
      table.string('displayName');
      table.string('google_id');
      table.string('photo');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('cascade');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('google_users');
};
