
/************************************

	AUDIO LAYER CHILD CLASS
	

************************************/

var AudioLayer = ProtoLayer.extend({
	
	layerType : 'VISUAL',
	draggable : false,
	thumbUpdate : false,
	
	defaultAttributes : {
		'title' : 'Video Layer',
		'url' : 'none',
		'in'  : 0,
		'out' : 0,
		'volume' : 50,
	},

	controls : function()
	{
		var div = $('<div>')
			.addClass('timeLEF layerEditingFrame')
			.attr('id','player-'+this.model.id);
		
		this.layerControls = div;
	},
	
	onControlsOpen: function()
	{
		console.log('Audio Controls Opened');
	
		if( !this.editorLoaded )
		{
			var _this = this;

			var html = $('<div>').addClass('clearfix')
				.css( 'height' , '140px' ) //this should moved out
				.html( this.getTemplate() );
			this.layerControls.prepend( html );
			
			this.player = new ZeegaVideoEditor(this.model.id,this.attr.url,this.attr.in,this.attr.out,this.attr.volume,'layer-preview-'+this.model.id , 'player-' +this.model.id);

			//player triggers 'update' event to persist changes
			this.layerControls.bind( 'updated' , function(){
				var properties = {
					inPoint : {
						property : 'in',
						value : _this.player.getInPoint(),
						css : false
					},
					outPoint : {
						property : 'out',
						value : _this.player.getOutPoint(),
						css : false
					},
					volume : {
						property : 'volume',
						value : _this.player.getVolume(),
						css : false
					}
				};
				_this.layerControls.trigger( 'update' , [ properties ]);
			});
			this.editorLoaded = true;
		}
	},
	
	onControlsClose: function()
	{
		if(this.player) this.player.pause();
	},
	
	preload : function(){
		this.display.attr({
			'id' : 'layer-preview-'+this.model.id,
			'data-layer-id' : this.model.id
		});
		this.player = new ZeegaVideoPlayer(this.model.id,this.attr.url,this.attr.in,this.attr.out,this.attr.volume,'layer-publish-'+this.model.id,'zeega-player');
	},
	
	play : function()
	{
		this.player.play();
	},
	
	pause : function()
	{
		this.player.pause();
	},
	
	stash : function()
	{
		this.player.pause();
	},
	
	exit: function()
	{
		this.player.pause();
	},
	
		getTemplate : function(){
	
		var 		html ='		<div id="loadingMP" ><p>Loading Media...</p></div>';
		html+='<div id="durationWrapper"><span style="line-height: 1.9;"> Duration: </span><span id="layerDuration" class="layerLength">0 </span> </div>';
		html +='<div id="avControls"> ';
		html +='<div id="avStart"> ';
		html +='<span style="font-weight: bold;">In:</span><span id="avStartMinutes" >0</span>:<span id="avStartSeconds" >0</span>';
		html +='</div>';
		html +='<div id="avStop"> ';
		html +='<span style="font-weight: bold;">In:</span><span id="avStopMinutes" >0</span>:<span id="avStopSeconds" >0</span>';
		html +=	'</div>';
		html +='</div>';
		html +='<div class="avComponent"> ';
		html +='	<div id="mediaPlayerMP"> ';

		html +='		<div id="playMP" class="playButtonMP"> </div> ';
		html +='		<div id="loadingOutsideMP"> ';
		html +='			<div id="startBar"></div>';
		html +='			<div id="stopBar"></div>';
		html +='			<div id="startMP" class="markerMP"><div class="bar"></div><div class="arrow-down"></div></div>';
		html +='			<div id="stopMP" class="markerMP"><div class="bar"></div><div class="arrow-down"></div></div>';
		html +='			<div id="currentMP" class="markerMP"><div class="box"></div></div>';
		html +='			<div id="loadingInsideMP"> </div> ';
		html +='			<div id="loadingStatusMP"></div> ';
		html +='		</div> ';
		html +='		<div id="timeWrapperMP"><span id="currentTime"></span> </div>';
		html +='	</div>				';	 
		html +='</div> <!-- #avComponent --> ';
		html +='<div id="clear"></div> ';
		html +='<div id ="volumeMP">';
		html +='<h4 style="margin:10px">Volume</h4>';
		html +='<div id="volume-slider" ></div>';
		html +='</div>';
		return html;
	}
	
});