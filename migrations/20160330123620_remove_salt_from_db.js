
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.dropColumn('salt')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.string('salt');
  });
};
