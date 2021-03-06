

var VisualLayerEditorView = Backbone.View.extend({	
	
	tagName : 'div',
	
	initialize : function()
	{
		this.model.bind( 'change:visibleineditor', this.showHide, this );
		
	},
	
	//draws the controls
	render : function(i)
	{
		var _this = this;
		
		this.model.set({visibleineditor:true});
		//remove this view when the model is removed
		this.model.bind('remove',function(){ _this.remove() });
				
		//set the view element to whatever the layerclass returns for the visual editor
		//$(this.el).append( this.model.layerClass.drawToVisualEditor() );
		
		this.el = this.model.layerClass.drawToVisualEditor();
		
		if(this.model.layerClass.draggable)
		{
			$(this.el).draggable({
				stop : function(){
					var pos = $(this).position();

					var parentWidth = $(this).parent().css('width').replace(/px/,'');
					var parentHeight = $(this).parent().css('height').replace(/px/,'');
					
					var left = ( pos.left / parentWidth ) * 100;
					var top = ( pos.top / parentHeight ) * 100;
					
					var settings = [{
						left: {property:'left',value:left,suffix:'%'},
						top: {property:'top',value:top,suffix:'%'}
						}]

					_this.model.layerClass.layerControls.trigger('update',settings);
				}
			});
		}

		$(this.el).addClass('media')
			.attr({
				'id' : 'layer-preview-'+ _this.model.id,
				'data-layer-id' : _this.model.id
			});
			
			
		var cssObj = {
			'position' : 'absolute',
			'top' : _this.model.get('attr').top  +'%',
			'left' : _this.model.get('attr').left  +'%',
			'width' : _this.model.get('attr').w+'%',
			'opacity' : _this.model.get('attr').opacity
		};

		$(this.el).css(cssObj);
		
		this.model.layerClass.setZIndex( i );
		
		this.model.layerClass.onDomPlacement();
		
		//return the view
		return this;
	},
	
	showHide : function()
	{
		if( this.model.get('visibleineditor') ) $(this.el).fadeIn('fast');
		else $(this.el).fadeOut('fast');
	}
	
});


var VisualLayerEditorViewCollection = Backbone.View.extend({

	el : $('#visual-editor-workspace'),
	
	initialize : function( options )
	{
		var _this = this;
		
		//make arrays to store the views in
		this._renderedViews =[];
		
		this.collection.bind("add", function(layer) {
			_this.add(layer);
		});
		
		this.collection.bind("remove", function(layer) {
			_this.remove(layer);
		});
		this.collection.bind("reset", function() {
			// should draw the layer if it's in the frame
			_this.reset();
		});

	},
	
	add : function ( layer )
	{
		var layerView = new VisualLayerEditorView({ model : layer });
		this._renderedViews.push( layerView );
		$(this.el).append( layerView.render().el );
		
		this.drawEditorIcons();
		//console.log(this._renderedViews);
	},
	
	remove : function(layer)
	{
		console.log('remove view')
		var viewToRemove = this; // _(this._layerViews.select(function(lv){return lv.model === model;}))[0];
		//this._renderedViews = _(this._renderedViews).without(viewToRemove);
		
		
		this._renderedViews = _.without( this._renderedViews, viewToRemove);
		Zeega.currentFrame.noteChange();
	},
	
	
	render : function()
	{
		var _this = this;
		$(this.el).empty();
		
		return this;
	},
	
	reset : function()
	{
		this._renderedViews = [];
	},
	
	drawEditorIcons : function()
	{
		$('#visualeditor-view-bar').find('.icon-tray').empty();
		var types = [];
		_.each( this._renderedViews , function(view){
			types.push( view.model.get('type').toLowerCase() );
		});
		//types = _.uniq( types );
		_.each( types, function(type){
			var icon = $('<span>').addClass('zicon grey zicon-' +type);
			var li = $('<li>').append(icon);
			$('#visualeditor-view-bar').find('.icon-tray').append(li)
		});
	}

});



