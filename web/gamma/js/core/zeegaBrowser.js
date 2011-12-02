var ZeegaBrowser = {

	myCollectionsModel : null,
	myCollectionsView : null,
	search : null, 
	searchItemsView : null,
	searchCollectionsView : null,

	init : function()
	{
		//Load MyCollections
		this.myCollectionsModel = new MyCollections();
		this.myCollectionsView = new MyCollectionsView({ collection : this.myCollectionsModel });
			

		//Hide the loading spinner for the myCollections drawer
		$('#browser-my-collections .browser-loading').hide();

		//Load Search items
		this.search = new BrowserSearch();
		
		//attach items collection to items view and collections collection to collections view
		this.searchItemsView = new BrowserSearchItemsView({ collection: this.search.get("itemsCollection"), id : '54' });
		this.searchCollectionsView = new BrowserSearchCollectionsView({collection: this.search.get("collectionsCollection")});
		
		this.search.updateQuery();
		
	},
	renderResults : function(){
		this.searchItemsView.render();
		this.searchCollectionsView.render();
		
		//Hide results drawer's loading spinner
		$('#browser-results .browser-loading').hide();
	},
	
	myCollectionsQueryDone : function(){
		this.myCollectionsView.render();
	},

	doSearch : function(){
		
		
		//Empty items and collections from results drawer
		$('#browser-results #browser-results-collections').empty();
		
		//Show results drawer's loading spinner
		$('#browser-results .browser-loading').show();


		//Hide any previous results messages
		$('#browser-no-results-my-media-message').hide();
		$('#browser-no-items-results-message').hide();
		$('#browser-no-collections-results-message').hide();

		this.search.set({
							q: $('#database-search-text').val(), 
							content:$('#database-search-filter').val()
						});
		this.search.updateQuery();
	} 
	
}