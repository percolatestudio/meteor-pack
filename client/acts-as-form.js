// Binds forms to the session given a Template
//--------------------------------------------


// XXX: I guess this should be a mixin to a _controller/component_ not a template.
//
// In the meantime, this works for now.
//
// NOTE: if you want a destroyed callback on your template,
// you must add it BEFORE mixin this in.

ActsAsForm = function(templateName, options) {
  // XXX: note: you shouldn't ever be accessing this in the session!
  //   we could migrate this data ourselves (it might even be a good idea)
  var dataVarName = '__' + templateName + '__state__';
  var submittingVarName = '__' + templateName + '__submitting__';
  var errorsVarName = '__' + templateName + '__errors__';
  
  options = _.extend({}, {
    clearStateOnDestroy: true,
    collection: undefined,
    callbacks: {}
  }, options);
  
  var fns = {
    state: function(baseRecord) {
      var record = Session.get(dataVarName);
  
      if (! record)
        Session.set(dataVarName, record = baseRecord);
      
      if (options.collection)
        record = options.collection._transform(record);
      
      return record;
    },
    
    updateState: function(name, value) {
      var state = this.state();
      
      // this happens if clearState has been called--i.e. the form is gone
      if (! state)
        return;
      
      _.setDottedProperty(state, name, value);
      
      // NOTE: don't be worried about calling this repeatedly as 
      // flushing means there's no real inefficiency
      Session.set(dataVarName, state);
      
      options.callbacks.update 
        && options.callbacks.update.call(state, name, value, this);
    },
    
    clearState: function() {
      Session.set(dataVarName, null);
      Session.set(submittingVarName, null);
      Session.set(errorsVarName, null);
    },
    
    clearErrors: function() {
      Session.set(errorsVarName, null);
    },
    
    // call this when the form fails and you need to:
    //   1. un-disable your submit buttons
    //   2. put the errors down
    //
    // the structure of the errors is:
    //
    //  { fieldName: 'error message' }
    //
    // which is what you should get out of validatedCollection.errors(obj)
    onError: function(errors) {
      Session.set(errorsVarName, errors);
      Session.set(submittingVarName, false);
      
      // Focus the first field that contains an error
      Meteor.setTimeout(function() {
        var fieldName = $('.error').first().parent().attr('for');
        if (fieldName) {
          $("input[name='" + fieldName + "']").first().focus();
        }
      });
    },
    
    submitting: function(value) {
      Session.set(submittingVarName, value);
    }
  }
  
  
  var templ = Template[templateName];
  
  if (! templ)
    throw "actsAsForm: must pass in template name as first argument";
  
  // XXX: sucks that we can't additively set created/destroyed handlers
  var oldCreated = templ.created;
  templ.created = function() {
    var self = this;
    
    _.each(fns, function(f, key) {self[key] = f});
    oldCreated && oldCreated.call(this);
  }
  
  var oldDestroyed = templ.destroyed;
  templ.destroyed = function() {
    if (options.clearStateOnDestroy)
      this.clearState();

    oldDestroyed && oldDestroyed.call(this);
  }
  
  
  // OK, first up, when we are rendered, we can expect the session var to be
  // unset; UNLESS:
  //   1. HCR - the session var will still be in there, we should use it's state
  //   2. A change to the underlying object (e.g. edit by another user). 
  //        - this is a bit trickier, but I thinking using the old value
  //          (i.e. what's in the session) is usually correct. This could be
  //          an option though
  templ.helpers({
    formData: function() { 
      return fns.state(this || {}); 
    },
    submitting: function() { 
      return Session.get(submittingVarName);
    },
    formError: function(name) {
      var errors = Session.get(errorsVarName);
      var error = errors && errors[name];
      
      if (error)
        return new Handlebars.SafeString('<span class="error">' + error + '</span>');
    },
    errorLabel: function(name, title) {
      var errors = Session.get(errorsVarName);
      var error = errors && errors[name];
      
      if (error) {
        var label = '<label for="' + name + '">' + title;
        var error = '<span class="error">' + error + '</span>';
        return new Handlebars.SafeString(label + error + '</label>');
      }
    },
    titleOrError: function(name, title) {
      var errors = Session.get(errorsVarName);
      var error = errors && errors[name];

      if (error)
        return new Handlebars.SafeString(error);
      else
        return title;
    },
    //bootstrap uses this css class
    hasError: function(name) {
      var errors = Session.get(errorsVarName);
      var error = errors && errors[name];

      if (error)
        return 'has-error';
    },
    //return 'error' if name field has an error
    errorClass: function(name) {
      var errors = Session.get(errorsVarName);
      var error = errors && errors[name];

      if (error)
        return 'error';
    },
    //return 'success' if name field has no error and field is not empty
    successClass: function(name) {
      var errors = Session.get(errorsVarName);
      var datas = Session.get(dataVarName);

      var error = errors && errors[name];
      var data = datas && datas[name];

      if (! error && data)
        return 'success';
    }
  });
  
  
  var elementHandler = function(element, template) {
    var value = element.value;
    var $element = $(element);
    
    if ($element.is('[type=checkbox]'))
      value = $element.is(':checked');
    
    template.updateState(element.name, value);
    
    return value;
  }
  
  var handler = function(e, template) {
    // DON'T return this (as it could be false and cancel the event)
    elementHandler(e.target, template);
  }
  
  var events = {
    // when the form submits, make sure we read every value, just in
    // case one of the above hasn't fired yet.
    'submit': function(e, template) {
      var data = this;
      $(e.target).find('input,select,textarea').each(function() {
        var value = elementHandler(this, template);
        
        // also instantly update the data context, in case the real 
        // event hander is using it
        _.setDottedProperty(data, this.name, value);
      });
    }
  };

  _.extend(events, {
    'change [name]': handler,
  
    // XXX: still need to investigate further into alternatives to
    // the debounce here
    'keyup [name]': _.debounce(handler, 500),
  });
  
  templ.events(events);

  // XXX: hook in saving state when Hot Code Reload happens
  // Meteor._reload.onMigrate('ActsAsForm', function() {
  //   console.log('HCRing!!!');
  //   return [true]; //ok to migrate
  // });
}
