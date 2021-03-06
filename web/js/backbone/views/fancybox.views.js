var FancyBoxView = Backbone.View.extend({
	tagName:'div',
	id:'fancybox-media-container',
	initialize: function(){
	},
	
	events : {
		
		'click .fancybox-more-button' : 'more',
		'click .fancybox-less-button' : 'less',

	},
	more : function(){
		var _this=this;
		sessionStorage.setItem('moreFancy', true);
		$(this.el).find('.less').hide();
		$(this.el).find('.more').fadeIn('fast',function(){
			if(_this.locatorMapView.geoLocated)_this.locatorMapView.addMap();
			
			
		});
		
		
		
		$(this.el).find(".fancybox-media-wrapper").addClass("fancybox-media-wrapper-more");
		$(this.el).find(".fancybox-left-column").addClass("fancybox-left-column-more");
		$(this.el).find(".fancybox-media-item").addClass("fancybox-media-item-more");
		$(this.el).addClass("fancybox-media-container-more");	
		
		//Show delete button in More view if user added this item
		console.log(sessionStorage.getItem("userid") + ' is session nid');
		console.log(this.model.get("user_id") + ' is mode; nid');
		if(sessionStorage.getItem("userid") == this.model.get("user_id")){
			$(this.el).find('.fancybox-delete-button').show();
		} else{
			$(this.el).find('.fancybox-delete-button').hide();
		}
		
		return false;
	},
	less : function( ){
		sessionStorage.setItem('moreFancy', false);
		$(this.el).find('.more').hide();
		$(this.el).find('.less').show();
		$(this.el).find(".fancybox-media-wrapper").removeClass("fancybox-media-wrapper-more");
		$(this.el).find(".fancybox-left-column").removeClass("fancybox-left-column-more");
		$(this.el).find(".fancybox-media-item").removeClass("fancybox-media-item-more");
		$(this.el).removeClass("fancybox-media-container-more");	
		return false;
	},
	render: function(obj)
	{

		/** Temp Fix **/
		var blanks = {
			sourceLink : this.model.get('attribution_uri'),
			title : this.model.get('title') == "none" ? this.model.get('layer_type') : this.model.get('title'),
			description : this.model.get('description'),
			creator : this.model.get('media_creator_username'),
		};
		
		if(this.model.get('attribution_uri').indexOf('flickr')>-1) blanks.sourceText = 'View on Flickr';
		else 	if(this.model.get('attribution_uri').indexOf('youtube')>-1) blanks.sourceText = 'View on Youtube';
		else 	if(this.model.get('attribution_uri').indexOf('soundcloud')>-1) blanks.sourceText = 'Listen on Soundcloud';
		else blanks.sourceText ='View Source';
	
		
		//use template to clone the database items into
		var template = _.template( this.getTemplate() );
		
		//copy the cloned item into the el
		$(this.el).append( template( blanks ) );
		
		// Add map view
		this.locatorMapView= new LocatorMapView({model:this.model});
		$(this.el).find('.geo').append(this.locatorMapView.render());
		
		//Add tag view
		this.tagView = new ItemTagView({model:this.model});
		$(this.el).find('.tags').empty().append(this.tagView.render());
		this.tagView.loadTags();
	
		//Fancybox will remember if user was in MORE or LESS view
		if (sessionStorage.getItem('moreFancy') == "true"){
			this.more(this.el);
		} else {
			this.less(this.el);
		}
		
	
		

	
		var _this=this;
		
	
	


		
		//EDIT TITLE
		$(this.el).find('.title').editable(
			function(value, settings)
			{ 
				_this.model.save({ title:value }, 
						{
							success: function(model, response) { 
								console.log("Updated item title for item " + model.id);
			 				},
			 				error: function(model, response){
			 					
			 					console.log("Error updating item title.");
			 					console.log(response);
			 				}
			 			});
				return value; //must return the value
			},
			{
				indicator : 'Saving...',
				tooltip   : 'Click to edit...',
				indicator : '<img src="images/loading.gif">',
				select : false,
				onblur : 'submit',
				width : 250,
				cssclass : 'fancybox-form'
		});
		//EDIT DESCRIPTION
		$(this.el).find('.description').editable(
			function(value, settings)
			{ 
				_this.model.save({ description:value }, 
						{
							success: function(model, response) { 
								theElement.find('.description').text(_this.model.get("description"));
								console.log("Updated item description for item " + _this.model.id);
			 				},
			 				error: function(model, response){
			 					
			 					console.log("Error updating item description.");
			 					console.log(response);
			 				}
			 			});
				return value; //must return the value
			},
			{
				type 	: 'textarea',
				indicator : 'Saving...',
				tooltip   : 'Click to edit description...',
				indicator : '<img src="images/loading.gif">',
				select : false,
				onblur : 'submit',
				width : 250,
				cssclass : 'fancybox-form'
		});
		//EDIT CREATOR
		$(this.el).find('.creator').editable(
			function(value, settings)
			{ 
				_this.model.save({ "media_creator_username":value }, 
						{
							success: function(model, response) { 
								console.log("Updated item creator for item " + _this.model.id);
			 				},
			 				error: function(model, response){
			 					
			 					console.log("Error updating item creator.");
			 					console.log(response);
			 				}
			 			});
				return value; //must return the value
			},
			{
				indicator : 'Saving...',
				tooltip   : 'Click to edit...',
				indicator : '<img src="images/loading.gif">',
				select : false,
				onblur : 'submit',
				width : 150,
				cssclass : 'fancybox-form'
		});
		
		$(this.el).find('.no-do-not-delete').click(function(e){
			$('.fancybox-delete-button').show();
			$('.fancybox-confirm-delete-button').hide();
			e.preventDefault();
		});
		$(this.el).find('.yes-confirm-delete').click(function(e){
			
			var deleteURL = sessionStorage.getItem('hostname')+sessionStorage.getItem('directory') + "api/items/"
						+ _this.model.id;
			

			//DESTROYYYYYYYY
			_this.model.destroy({	
				 				url : deleteURL,
								success: function(model, response) { 
									console.log("Deleted item " + _this.model.id);	
									

									//close fancy box window
									jQuery.fancybox.close();
										
				 				},
				 				error: function(model, response){
				 					
				 					console.log("Error deleting item " + _this.model.id);		
				 					console.log(response);
				 				}
		 					});
			e.preventDefault();
		});
		//DELETE button
		$(this.el).find('.fancybox-delete-button').click(function(e){
			$(this).hide();
			$('.fancybox-confirm-delete-button').show();
			
		 	e.preventDefault();
		});
		
		
		
		return this;
	},
	getTemplate : function()
	{
		
		var html =	'<div class="fancybox-media-wrapper">'+
						'<div class="fancybox-left-column">' +
							'<div class="fancybox-media-item media-item"></div>'+
							'<p class="more subheader" style="clear:both">Tags</p><div class="more tags"></div>'+
						'</div>'+
						'<p class="fancybox-editable title"><%= title %></p>'+
						'<p><span class=" creator fancybox-editable"><%= creator %></span> <span class="source"><a href="<%= sourceLink %>" target="_blank"><%= sourceText %></a></span></p>'+
						'<p class="more subheader">Description</p><p class="more description fancybox-editable"><%= description %></p>'+
						'<div class="more geo"></div>'+
						
					'</div>'+
					'<div class="fancybox-buttons" class="clearfix">'+
						'<p class="less fancybox-more-button"><a href=".">view more</a></p><p class="more fancybox-less-button"><a href=".">view less</a></p>'+
						'<p class="fancybox-delete-button more" style="display:none"><a href=".">delete</a></p>'+
						'<p class="fancybox-confirm-delete-button">are you totally sure you want to delete this? '+
						'<a href="." class="yes-confirm-delete">yes</a> <a class="no-do-not-delete" href=".">no</a></p>'+
						
					'</div>';
								
		return html;
	},
});
// For displaying Images
var FancyBoxImageView = FancyBoxView.extend({
	
	initialize: function(){

		FancyBoxView.prototype.initialize.call(this); //This is like calling super()
		
	},
	/* Pass in the element that the user clicked on from fancybox. */
	render: function(obj)
	{
		
		sessionStorage.setItem('currentItemId', this.model.id);
		console.log('this model id is'+this.model.id);
		//Call parent class to do captioning and metadata
		FancyBoxView.prototype.render.call(this, obj); //This is like calling super()
		
	
		
		console.log(this.model);
		//Fill in image-specific stuff
		var blanks = {
			src : this.model.get('uri'),
			title : this.model.get('title'),
		};
		
		//use template to clone the database items into
		var template = _.template( this.getMediaTemplate() );
		
		//copy the cloned item into the el
		var imageHTML =  template( blanks ) ;

		$(this.el).find('.fancybox-media-item').html(imageHTML);

		//set fancybox content
		obj.content = $(this.el);
		
		

		
		return this;
	},
	getMediaTemplate : function()
	{
		
		var html =	''+
						'<img src="<%=src%>" title="<%=title%>" alt="<%=title%>"/>'+
					'';
								
		return html;
	},

});
// For displaying HTML5 Video (not YouTube)
var FancyBoxVideoView = FancyBoxView.extend({
	
	initialize: function(){
		FancyBoxView.prototype.initialize.call(this); //This is like calling super()

	},
	/* Pass in the element that the user clicked on from fancybox. */
	render: function(obj)
	{
		
		sessionStorage.setItem('currentItemId', this.model.id);
		
		//Call parent class to do captioning and metadata
		FancyBoxView.prototype.render.call(this, obj); //This is like calling super()
		
		//Fill in media-specific stuff
		var blanks = {
					src : this.model.get('uri'),
		};
		
		//use template to clone the database items into
		var template = _.template( this.getMediaTemplate() );
		
		//copy the cloned item into the el
		var mediaHTML =  template( blanks ) ;

		$(this.el).find('.fancybox-media-item').html(mediaHTML);


		


		//set fancybox content
		obj.content = $(this.el);
		
		return this;
	},
	getMediaTemplate : function()
	{
		
		var html =	'<div id="fancybox-video">'+
						'<video controls="true"  width="90%" preload><source src="<%=src%>"></video>'+
					'</div';
								
		return html;
	},

});
// For displaying Audio
var FancyBoxAudioView = FancyBoxView.extend({
	
	initialize: function(){
		FancyBoxView.prototype.initialize.call(this); //This is like calling super()
		

	},
	/* Pass in the element that the user clicked on from fancybox.  */
	render: function(obj)
	{
		
		sessionStorage.setItem('currentItemId', this.model.id);
		
		//Call parent class to do captioning and metadata
		FancyBoxView.prototype.render.call(this, obj); //This is like calling super()
		

		
		//Fill in media-specific stuff
		var blanks = {
					src : this.model.get('uri'),
		};
		
		//use template to clone the database items into
		var template = _.template( this.getMediaTemplate() );
		
		//copy the cloned item into the el
		var mediaHTML =  template( blanks ) ;

		$(this.el).find('.fancybox-media-item').html(mediaHTML);

		//set fancybox content
		obj.content = $(this.el);
		
		return this;
	},
	getMediaTemplate : function()
	{
		
		var html =	'<div id="fancybox-audio">'+
					'<audio width="626px" controls="true" src="<%=src%>"></audio>'+
					'</div>';
								
		return html;
	},

});

//For displaying YouTube
var FancyBoxYouTubeView = FancyBoxView.extend({
	
	initialize: function(){
		FancyBoxView.prototype.initialize.call(this); //This is like calling super()

	},
	/* Pass in the element that the user clicked on from fancybox. */
	render: function(obj)
	{
		
		sessionStorage.setItem('currentItemId', this.model.id);
		
		//Call parent class to do captioning and metadata
		FancyBoxView.prototype.render.call(this, obj); //This is like calling super()
		
	
		
		
		//Fill in media-specific stuff
		var blanks = {
			src : 'http://www.youtube.com/embed/' + $(obj.element).attr("href"),
		};
		
		//use template to clone the database items into
		var template = _.template( this.getMediaTemplate() );
		
		//copy the cloned item into the el
		var mediaHTML =  template( blanks ) ;

		$(this.el).find('.fancybox-media-item').html(mediaHTML); 

		//set fancybox content
		obj.content = $(this.el);
		
		return this;
	},
	getMediaTemplate : function()
	{
		
		var html =	'<div id="fancybox-youtube media-item">'+
					'<iframe class="youtube-player" type="text/html" width="100%" height="335" src="<%=src%>" frameborder="0">'+
					'</iframe></div>';
								
		return html;
	},

});
// For displaying Tweets
var FancyBoxTweetView = FancyBoxView.extend({
	
	initialize: function(){

		FancyBoxView.prototype.initialize.call(this); //This is like calling super()
		
	},
	/* Turns tweet text into proper links */
	linkifyTweet : function(tweet){

		//linkify urls
		var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    	tweet = tweet.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 

    	//linkify users
    	 tweet = tweet.replace(/(^|)@(\w+)/gi, function (s) {
        	return '<a target="_blank" href="http://twitter.com/' + s + '">' + s + '</a>';
    	});

    	//linkify tags
    	tweet = tweet.replace(/(^|)#(\w+)/gi, function (s) {
        	return '<a target="_blank" href="http://search.twitter.com/search?q=' + s.replace(/#/,'%23') + '">' + s + '</a>';
     	});

    	return tweet;
	},
	/* Pass in the element that the user clicked on from fancybox. */
	render: function(obj)
	{
		
		//Call parent class to do captioning and metadata
		FancyBoxView.prototype.render.call(this, obj); //This is like calling super()
		var tweet = this.model.get('text');

		//Fill in tweet-specific stuff
		var blanks = {
			tweet : this.linkifyTweet(tweet),
			
		};
		
		//use template to clone the database items into
		var template = _.template( this.getMediaTemplate() );
		
		//copy the cloned item into the el
		var tweetHTML =  template( blanks ) ;

		$(this.el).find('.fancybox-media-item').html(tweetHTML);

		//set fancybox content
		obj.content = $(this.el);
		
		

		
		return this;
	},
	getMediaTemplate : function()
	{
		
		var html =	'<p class="fancybox-tweet"><%= tweet %></p>';
								
		return html;
	},

});
// For displaying Documents
var FancyBoxDocCloudView = FancyBoxView.extend({
	
	events : {
		
		'click .fancybox-more-button' : 'more',
		'click .fancybox-less-button' : 'less',

	},
	more : function(){

		//call parent MORE method to lay out metadata
		FancyBoxView.prototype.more.call(this);

		this.fillInTemplate(this.getMediaTemplate(275, 375));

		return false;
	},
	less : function(){

		//call parent LESS method to lay out metadata
		FancyBoxView.prototype.less.call(this);

		this.fillInTemplate(this.getMediaTemplate(630,400));

		return false;
	},
	initialize: function(){

		FancyBoxView.prototype.initialize.call(this); //This is like calling super()
		
	},
	fillInTemplate : function(template){
		//use template to clone the database items into
		var template = _.template( template );
		
		//Fill in info
		var blanks = {
			
			uri : this.model.get('uri'),
		};
		//copy the cloned item into the el
		var docHTML =  template( blanks ) ;

		$(this.el).find('.fancybox-media-item').html(docHTML);
	},
	
	/* Pass in the element that the user clicked on from fancybox. */
	render: function(obj)
	{
		
		//Call parent class to do captioning and metadata
		FancyBoxView.prototype.render.call(this, obj); //This is like calling super()
		

		/* Because the document viewer needs to be reloaded for MORE and LESS views
		this will be handled by the MORE and LESS methods in this class which call the parent
		FancyBoxView class to handle the metadata and stuff.

		So if you need to change how this renders change it in the MORE or LESS or FILLINTEMPLATE functions
		 of this class.
		*/

		//set fancybox content
		obj.content = $(this.el);
		
		return this;
	},
	getMediaTemplate : function(width, height){
		var html =	'<div id="fancybox-document-cloud" class="DV-container"></div>'+
					'<script>'+
					"DV.load('http://www.documentcloud.org/documents/<%= uri %>.js', {"+
					'sidebar: false, width:'+width+',height:'+height+','+
					'container: "#fancybox-document-cloud"'+
					'      });'+
					'</script>';
								
		return html;
	}
	

});