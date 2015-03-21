/* global _, rulesByCollection:true, addFuncForAll:true, ensureCreated:true, ensureDefaultAllow:true */

rulesByCollection = {};

var created = {
  allow: {
    insert: {},
    update: {},
    remove: {}
  },
  deny: {
    insert: {},
    update: {},
    remove: {}
  }
};

/**
 * Adds the given function as an allow or deny function for all specified collections and types.
 * @param {Array(Mongo.Collection)} collections Array of Mongo.Collection instances
 * @param {String}                  allowOrDeny "allow" or "deny"
 * @param {Array(String)}           types       Array of types ("insert", "update", "remove")
 * @param {Array(String)|null}      fetch       `fetch` property to use
 * @param {Function}                func        The function
 */
addFuncForAll = function addFuncForAll(collections, allowOrDeny, types, fetch, func) {
  var rules = {};
  if (_.isArray(fetch)) {
    rules.fetch = fetch;
  }
  _.each(types, function (t) {
    rules[t] = func;
  });
  _.each(collections, function (c) {
    c[allowOrDeny](rules);
  });
};

/**
 * Creates the allow or deny function for the given collections if not already created. This ensures that this package only ever creates up to one allow and one deny per collection.
 * @param   {String}                  allowOrDeny "allow" or "deny"
 * @param   {Array(Mongo.Collection)} collections An array of collections
 * @param   {Array(String)}           types       An array of types ("insert", "update", "remove")
 * @param   {Array(String)|null}      fetch       `fetch` property to use
 * @param   {Function}                func        The function
 */
ensureCreated = function ensureCreated(allowOrDeny, collections, types, fetch, func) {
  _.each(types, function (t) {
    collections = _.reject(collections, function (c) {
      return _.has(created[allowOrDeny][t], c._name);
    });
    addFuncForAll(collections, allowOrDeny, [t], null, func);
    // mark that we've defined function for collection-type combo
    _.each(collections, function (c) {
      created[allowOrDeny][t][c._name] = true;
    });
  });
};

/**
 * Sets up default allow functions for the collections and types.
 * @param   {Array(Mongo.Collection)} collections Array of Mongo.Collection instances
 * @param   {Array(String)}           types       Array of types ("insert", "update", "remove")
 */
ensureDefaultAllow = function ensureDefaultAllow(collections, types) {
  ensureCreated("allow", collections, types, [], function () {
    return true;
  });
};
