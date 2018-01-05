
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('games', function(table) {
    table.integer('winner').alter();
    table.integer('loser').alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('games', function(table) {
    table.string('winner').alter();
    table.string('loser').alter();
  });
};