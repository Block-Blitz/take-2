exports.up = function(knex, Promise) {
  return knex.schema.createTable('games', function (table) {
    table.increments('id').primary();
    table.string('winner');
    table.string('loser');
    table.timestamp('ended_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

  });
};

exports.down = function(knex, Promise) {
   return knex.schema.dropTable('games');
};