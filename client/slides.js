Template.slides.slides = function () {
  return Slides.find({}, {sort: {order: 1}});
};
Template.slide.title = function () {
  return this.title || "Slide " + this.order;
};

Template.new_slide.events = {
  'submit': function (event) {
    event.preventDefault();
    var form={};

    $.each($(event.currentTarget).serializeArray(), function() {
        form[this.name] = this.value;
    });
    form['order'] = parseInt(form['order'] || 1, 10);
    Slides.insert(form);
    Meteor.Router.to('/');
  }
};

Template.slide.current = function () {
  currentId = (Session.get('selectedSlide') || Slides.findOne({})._id);
  return (currentId === this._id) ? "current" : undefined;
};


Meteor.Router.add({
  '': 'hello',
  '/slides/new': 'new_slide',
  '/presentation/:id': function (event) {

    return 'presentation';
  }
});


Template.new_slide.currentOrder = function () {
  return Slides.find({}, {sort: {order: 1}}).count() + 1;
};

Template.slide.events =  {
  'click .delete': function (event) {
    event.preventDefault();
    Slides.remove({_id: this._id});
  }
};

prevId = function(arrayCursor, id) {
  array = arrayCursor.map(function(item){
    return item._id;
  });
  if (!id) return array[0];
  index = array.indexOf(id);
  return array[Math.max(index - 1, 0)];
};

nextId = function (arrayCursor, id) {
  array = arrayCursor.map(function(item){
    return item._id;
  });
  if (!id) return array[array.length - 1];
  index = array.indexOf(id);
  return array[Math.min(index + 1, array.length - 1)];
};

Template.presentation.created = function (event) {
  if (!this.keydown) {
    Slides.find({}, {sort: {order: 1}}).observe({
      added: function (item) {
        Session.set('selectedSlide', Slides.findOne({}, {sort: {order: 1}})._id);
      }
    });
    this.keydown = $(document).on('keydown', function(event) {
      switch (event.which) {
        case 37:
          // back
          Session.set('selectedSlide', prevId(Slides.find({}, {sort: {order: 1}}), Session.get('selectedSlide')));
          break;
        case 39:
          // next
          Session.set('selectedSlide', nextId(Slides.find({}, {sort: {order: 1}}), Session.get('selectedSlide')));
          break;
      }
    });
  }
};

Template.presentation.destroyed = function (event) {
  $(document).off('keydown', this.keydown);
};
