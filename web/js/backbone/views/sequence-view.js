var SequenceView = Backbone.View.extend({
	tagName: 'span',
	
	render: function()
	{
		var that = this;
		$(this.el).html(this.model.get('title'));
		//$('#sequence-title').empty();
		//copy the cloned item into the el
		
		/*
		$(this.el).editable(
			function(value,settings)
			{
				that.model.set( { 'title': value } );
				that.model.save();
				return value; //must return the value!!
			},
			{
				indicator : 'Saving...',
				tooltip   : 'Click to edit...',
				indicator : '<img src="images/loading.gif">',
				style : 'background:yellow'
			});
		*/
		
		//$('#sequence-title').html(this.el);
		return this;
	}
});