<?php

namespace Zeega\CoreBundle\Parser\Youtube;

use Zeega\CoreBundle\Parser\Base\ParserItemAbstract;
use Zeega\DataBundle\Entity\Media;
use Zeega\DataBundle\Entity\Tag;
use Zeega\DataBundle\Entity\Item;
use Zeega\DataBundle\Entity\Metadata;

use \DateTime;
use SimpleXMLElement;

class ParserYoutubeVideo extends ParserItemAbstract
{
	public function getItem($url, $itemId)
	{
		$originalUrl = 'http://gdata.youtube.com/feeds/api/videos/'.$itemId;

		// read feed into SimpleXML object
		$entry = simplexml_load_file($originalUrl);
		
		$entryMedia = $entry->children('http://search.yahoo.com/mrss/');
		$yt = $entryMedia->children('http://gdata.youtube.com/schemas/2007');

		$item= new Item();
		$metadata= new Metadata();
		$media = new Media();

		$arr = explode(':',$entry->id);
		$entryId = $arr[count($arr)-1];

		$attrs = $entryMedia->group->player->attributes();
		$attributionUrl = $attrs['url'];

		$item->setUri((string)$yt->videoid);
		$item->setTitle((string)$entryMedia->group->title);
		//$item->setDescription((string)$entryMedia->group->description);
		$item->setDescription((string)$entryMedia->group->keywords);
		$item->setAttributionUri((string)$attributionUrl);
		$item->setDateCreated(new \DateTime("now"));
		$item->setMediaType('Video');
		$item->setLayerType('Youtube');
		$item->setChildItemsCount(0);

		foreach($entry->children('http://www.georss.org/georss') as $geo)
		{
			foreach($geo->children('http://www.opengis.net/gml') as $position)
			{
				// Coordinates are separated by a space
				$coordinates = explode(' ', (string)$position->pos);

				$item->setMediaGeoLatitude((string)$coordinates[0]);
				$item->setMediaGeoLongitude((string)$coordinates[1]);
				break;
			}
		}

		$item->setMediaCreatorUsername((string)$entry->author->name);
		$item->setMediaCreatorRealname('Unknown');

		// read metadata from xml
		$attrs = $entryMedia->group->thumbnail->attributes();
		$thumbnailUrl = (string)$attrs['url'];

		// write metadata
		$item->setArchive('Youtube');
		$metadata->setLicense((string)$entryMedia->group->license);
		$metadata->setThumbnailUrl((string)$thumbnailUrl);
		
		$item->setThumbnailUrl((string)$thumbnailUrl);
		
		// read media from xml
		$attrs = $yt->duration->attributes();
		$duration = $attrs['seconds'];

		// write media information
		$media->setDuration((string)$duration);

		
		// access control
		$yt = $entry->children('http://gdata.youtube.com/schemas/2007');
		$embed = (isset($yt->accessContro)) ? 'true' : 'false';
		
		
		$item->setMetadata($metadata);
		$item->setMedia($media);
		if(isset($entry->children('http://gdata.youtube.com/schemas/2007')->noembed)) // deprecated, but works for now
		{
			return $this->returnResponse($item, false,"This video is not embeddable and cannot be added to Zeega.");
		}
		else
		{
			return $this->returnResponse($item, true);
		}
	}
}
