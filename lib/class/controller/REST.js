var mode = require('../../mode.js');
/**
 * @class RESTful controller
 */
module.exports = require('./base.js').extend(function() {
  /**
   * The model the controller is wrapper around.
   *
   * @type {Class}
   * @see mode.model.Base
   */
  this.model = null;
  /**
   * Index action.
   *
   * Used for listing model items.
   *
   * TODO: Implement searching and pagination.
   *
   * Arguments set:
   *
   *   - {Array} item Results list
   */
  this.index = function() {
    this.model.list({}, this.bind(function(items) {
      this.args.items = items;
      this.callback();
    }));
  };
  /**
   * Show action.
   *
   * Used for querying a specific item, by id.
   *
   * Arguments set:
   *
   *   - {Class} item Found model instance
   *
   * @throws {Exception} If item is not found
   */
  this.show = function() {
    this.model.item({id: this.args.id}, this.bind(function(item) {
      if (!item) {
        mode.throw(404, 'Invalid id');
      }
      this.args.item = item;
      this.callback();
    }));
  };
  /**
   * New action.
   *
   * Used for create forms. Once submitted, the form should
   * request the `create` action.
   *
   * Arguments set:
   *
   *   - {Class} item Empty model instance
   *
   * @see #create
   */
  this.new = function() {
    this.args.item = new this.model();
  };
  /**
   * Edit action.
   *
   * Used for update forms. Once submitted, the form should
   * request the `update` action.
   *
   * Arguments set:
   *
   *   - {Class} item Found model instance
   *
   * @throws {Exception} If item is not found
   * @see #update
   */
  this.edit = function() {
    this.model.item({id: this.args.id}, this.bind(function(item) {
      if (!item) {
        mode.throw(404, 'Invalid id');
      }
      this.args.item = item;
      this.callback();
    }));
  };
  /**
   * Create action.
   *
   * Requires POST request method.
   *
   * Redirects to the _index_ action of current controller on
   * success or loads the _create_ view under the same action,
   * in which case the form should have pre-populated values.
   *
   * Arguments set on error:
   *
   *   - {Class} item Pre-populated, new model instance
   *
   * @throws {Exception} If item is not found
   */
  this.create = function() {
    var data = this.data[this.model.group];
    if (!data) {
      mode.throw(404, 'No POST data');
    }
    var item = new this.model(data);
    item.save(this.bind(function(error) {
      this.emit('created', error, item);
      if (!error) {
        this.redirect('/{{controller}}');
      } else {
        this.args.item = item;
        this.callback('/{{controller}}/new');
      }
    }));
  };
  /**
   * Update action.
   *
   * Requires POST request method.
   *
   * Redirects to the _edit_ action of current controller on
   * success or loads the _edit_ view under the same action,
   * in which case the form should have pre-populated values.
   *
   * Arguments set on error:
   *
   *   - {Class} item Pre-populated, existing model instance
   *
   * @throws {Exception} If item is not found
   */
  this.update = function() {
    var data = this.data[this.model.group];
    if (!data) {
      mode.throw(404, 'No POST data');
    }
    this.model.item({id: data.id}, this.bind(function(item) {
      if (!item) {
        mode.throw(404, 'Invalid id');
      }
      item.update(data);
      item.save(this.bind(function(error) {
        this.emit('updated', error, item);
        if (!error) {
          this.redirect('/{{controller}}/edit', {id: item.id});
        } else {
          this.args.item = item;
          this.callback('/{{controller}}/edit');
        }
      }));
    }));
  };
  /**
   * Delete method.
   *
   * Requires POST request method.
   *
   * Redirects to the _index_ action of current controller on
   * success.
   *
   * TODO: Cover destroy errors.
   *
   * @throws {Exception} If item is not found
   * @see model.controller.Base#redirect
   */
  this.delete = function() {
    var data = this.data[this.model.group];
    if (!data) {
      mode.throw(404, 'No POST data');
    }
    this.model.item({id: data.id}, this.bind(function(item) {
      if (!item) {
        mode.throw(404, 'Invalid id');
      }
      item.destroy(this.bind(function(error) {
        this.emit('deleted', error, item);
        this.redirect('/{{controller}}');
      }));
    }));
  };
}, true);