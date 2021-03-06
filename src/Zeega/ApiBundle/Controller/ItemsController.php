<?php
namespace Zeega\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

use Zeega\DataBundle\Entity\Item;
use Zeega\DataBundle\Entity\Tag;
use Zeega\DataBundle\Entity\ItemTags;
use Zeega\CoreBundle\Helpers\ItemCustomNormalizer;
use Zeega\CoreBundle\Helpers\ResponseHelper;

class ItemsController extends Controller
{
    //  get_collections GET    /api/items.{_format}
    public function getItemsAction()
    {
        $query = array();
        
        $request = $this->getRequest();
        //  api global parameters
		$query["page"]  = $request->query->get('page');      //  string
		$query["limit"] = $request->query->get('limit');     //  string
		
		//  collection specific parameters
        $query['returnCollections'] = 0;
		$query['notContentType'] = "Collection";
        
        //  set defaults for missing parameters  
		if(!isset($query['page']))          $query['page'] = 0;
		if(!isset($query['limit']))         $query['limit'] = 100;
		if($query['limit'] > 100) 	        $query['limit'] = 100;
        
         //  execute the query
 		$queryResults = $this->getDoctrine()
 					        ->getRepository('ZeegaDataBundle:Item')
 					        ->searchItems($query);								
		
		$resultsCount = $this->getDoctrine()->getRepository('ZeegaDataBundle:Item')->getTotalItems($query);				
        
		$itemsView = $this->renderView('ZeegaApiBundle:Items:index.json.twig', array('items' => $queryResults, 'items_count' => $resultsCount));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemsView);
    }
    
    // get_collection GET    /api/item/{id}.{_format}
    public function getItemAction($id)
    {
        $em = $this->getDoctrine()->getEntityManager();
        
        $item = $em->getRepository('ZeegaDataBundle:Item')->findOneById($id);
        $itemTags = $em->getRepository('ZeegaDataBundle:ItemTags')->findByItem($id);
        
        $tags = array();
        foreach($itemTags as $tag)
        {
            array_push($tags, $tag->getTag()->getId() . ":" . $tag->getTag()->getName());
        }
        $tags = join(",",$tags);
                
        $itemView = $this->renderView('ZeegaApiBundle:Items:show.json.twig', array('item' => $item, 'tags' => $tags));
        
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);
    }
    
    // get_item_tags GET    /api/items/{itemId}/tags.{_format}
    public function getItemTagsAction($itemId)
    {
        $em = $this->getDoctrine()->getEntityManager();

        $tags = $em->getRepository('ZeegaDataBundle:ItemTags')->searchItemTags($itemId);

        $tagsView = $this->renderView('ZeegaApiBundle:Items:tags.json.twig', array('tags' => $tags, 'item_id'=>$itemId));
        
        return ResponseHelper::compressTwigAndGetJsonResponse($tagsView);
    }
    
    // get_item_tags GET    /api/items/{itemId}/similar.{_format}
    public function getItemSimilarAction($itemId)
    {
        $em = $this->getDoctrine()->getEntityManager();

        // get item tags
        $tags = $em->getRepository('ZeegaDataBundle:ItemTags')->searchItemTags($itemId);
        
        $tagsId = array();
        foreach($tags as $tag)
        {
            array_push($tagsId, $tag["id"]);
        }
        
        $tagsId = join(",",$tagsId);
        
		$query = array();
		$query['page'] = 0;
		$query['limit'] = 100;
		$query['tags'] = $tagsId;
		$query['item_id'] = $itemId;
		$query['not_item_id'] = $itemId;
		
        // get items with the same tags
        $queryResults = $em->getRepository('ZeegaDataBundle:Item')->searchItemsByTags($query);
        
		$resultsCount = $this->getDoctrine()->getRepository('ZeegaDataBundle:Item')->getTotalItems($query);				
        
		$itemsView = $this->renderView('ZeegaApiBundle:Items:index.json.twig', array('items' => $queryResults, 'items_count' => $resultsCount));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemsView);
    }   
    
	// delete_collection   DELETE /api/items/{collection_id}.{_format}
    public function deleteItemAction($item_id)
    {
    	$em = $this->getDoctrine()->getEntityManager();
     	$item = $em->getRepository('ZeegaDataBundle:Item')->find($item_id);
     	
     	if (!$item) 
        {
            throw $this->createNotFoundException('Unable to find a Collection with the id ' . $item_id);
        }
        
    	$em->remove($item);
    	$em->flush();
    	
        $itemView = $this->renderView('ZeegaApiBundle:Items:delete.json.twig', array('item_id' => $item_id, 'status' => "Success"));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);  
    }

	// post_collections POST   /api/collections.{_format}
    public function postItemsAction()
    {
        $user = $this->get('security.context')->getToken()->getUser();
    	
		$attributionUri = $this->getRequest()->request->get('attribution_uri');

	    $item = new Item();
       	
		$site = $this->getDoctrine()
				     ->getRepository('ZeegaDataBundle:Site')
				     ->findSiteByUser($user->getId());
		
		$item->setSite($site[0]);		
        $item->setTitle($this->getRequest()->request->get('title'));
		$item->setDescription($this->getRequest()->request->get('description'));
        $item->setMediaType($this->getRequest()->request->get('media_type'));
		$item->setArchive($this->getRequest()->request->get('archive'));
        $item->setLayerType($this->getRequest()->request->get('layer_type'));
        $item->setUser($user);
        $item->setUri($this->getRequest()->request->get('uri'));
        $item->setAttributionUri($this->getRequest()->request->get('attribution_uri'));
		$item->setThumbnailUrl($this->getRequest()->request->get('thumbnail_url'));
        $item->setChildItemsCount($this->getRequest()->request->get('child_items_count'));
        $item->setMediaCreatorUsername($this->getRequest()->request->get('media_creator_username'));
        $item->setMediaCreatorRealname($this->getRequest()->request->get('media_creator_realname'));
        
        $em = $this->getDoctrine()->getEntityManager();
        $em->persist($item);
        $em->flush();

        $itemView = $this->renderView('ZeegaApiBundle:Items:show.json.twig', array('item' => $item));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);
    }
	

	/*
    // post_items_tags  POST   /api/items/{itemId}/tags.{_format}
    public function postItemsTagsAction($itemId)
    {
        $user = $this->get('security.context')->getToken()->getUser();
        $em = $this->getDoctrine()->getEntityManager();

        $item = $em->getRepository('ZeegaDataBundle:Item')->find($itemId);

        if (!$item) 
        {
            throw $this->createNotFoundException('Unable to find the Item with the id . $itemId');
        }
        
        $tags_list = $this->getRequest()->request->get('tags');
        $tags_list = explode(',', $tags_list); 
        
        foreach($tags_list as $tagName)
        {
            $tag = $em->getRepository('ZeegaDataBundle:Tag')->findOneByName($tagName);
            
            if (!$tag) 
            {
                $tag = new Tag();
                $tag->setName($tagName);
                $tag->setDateCreated(new \DateTime("now"));
                $em->persist($tag);
                $em->flush();
            }
            
            // can't get EAGER loading for the item tags - this is a workaround
			$itemTags = $em->getRepository('ZeegaDataBundle:ItemTags')->searchItemTags($itemId);
	        foreach($itemTags as $itemTag)
        	{
        		
            	if($tag->getId() == $itemTag["id"])
            	{
            	return ResponseHelper::encodeAndGetJsonResponse($itemTag["id"]);
 		           	return ResponseHelper::encodeAndGetJsonResponse($itemTag);
            	}
        	}
        
           	$item_tag = new ItemTags;
			$item_tag->setItem($item);
			$item_tag->setTag($tag);
			$item_tag->setTagDateCreated(new \DateTime("now"));
		 	$item_tag->setTagDateCreated(new \DateTime("now"));

            $em->persist($item_tag);
            $em->flush();
        }
        
        return ResponseHelper::encodeAndGetJsonResponse($item);
    }
    */

      // post_items_tags  POST   /api/items/{itemId}/tags/{tag_name}.{_format}
    public function postItemsTagsAction($itemId,$tagName)
    {
        $user = $this->get('security.context')->getToken()->getUser();
        $em = $this->getDoctrine()->getEntityManager();

        $item = $em->getRepository('ZeegaDataBundle:Item')->find($itemId);
		if (!$item) 
        {
            throw $this->createNotFoundException('Unable to find the Item with the id . $itemId');
        }
        
        
        
      
            $tag = $em->getRepository('ZeegaDataBundle:Tag')->findOneByName($tagName);
            
            if (!$tag) 
            {
                $tag = new Tag();
                $tag->setName($tagName);
                $tag->setDateCreated(new \DateTime("now"));
                $em->persist($tag);
                $em->flush();
            }
            
            // can't get EAGER loading for the item tags - this is a workaround
			$itemTags = $em->getRepository('ZeegaDataBundle:ItemTags')->searchItemTags($itemId);
	        foreach($itemTags as $itemTag)
        	{
        		
            	if($tag->getId() == $itemTag["id"])
            	{
            	return ResponseHelper::encodeAndGetJsonResponse($itemTag["id"]);
 		           	return ResponseHelper::encodeAndGetJsonResponse($itemTag);
            	}
        	}
        
           	$item_tag = new ItemTags;
			$item_tag->setItem($item);
			$item_tag->setTag($tag);
			$item_tag->setTagDateCreated(new \DateTime("now"));
		 	$item_tag->setTagDateCreated(new \DateTime("now"));

            $em->persist($item_tag);
            $em->flush();
        
        
        return ResponseHelper::encodeAndGetJsonResponse($item);
    }
    
    // delete_items_tags  DELETE   /api/items/{itemId}/tags/{tagName}.{_format}
   
    public function deleteItemTagsAction($itemId, $tagName)
   {
       $user = $this->get('security.context')->getToken()->getUser();
               $em = $this->getDoctrine()->getEntityManager();

               $item = $em->getRepository('ZeegaDataBundle:Item')->find($itemId);
				   $tag = $em->getRepository('ZeegaDataBundle:Tag')->findOneByName($tagName);
				   
				   
               if (!$item)
               {
                       throw $this->createNotFoundException('Unable to find the Item with the id . $itemId');
               }

               $tag = $em->getRepository('ZeegaDataBundle:ItemTags')->findOneBy(array('item' => $itemId, 'tag' => $tag->getId()));

               if(isset($tag))
               {
                       $em->remove($tag);
                       $em->flush();
               }

               return ResponseHelper::encodeAndGetJsonResponse($item);
   }
    /**
	// post_items_tags  DELETE   /api/items/{itemId}/tags/{tag_name}.{_format}
    public function deleteItemTagsAction($itemId,$tag_name)
    {
    	$user = $this->get('security.context')->getToken()->getUser();
		$em = $this->getDoctrine()->getEntityManager();

		$item = $em->getRepository('ZeegaDataBundle:Item')->find($itemId);

		if (!$item) 
		{
			throw $this->createNotFoundException('Unable to find the Item with the id . $itemId');
		}

		$tags_list = $this->getRequest()->request->get('tags');
		//$tags_list = array('bananas');
		
		$tags_list = explode(',', $tags_list); 
		foreach($tags_list as $tagId)
		{
			$tag = $em->getRepository('ZeegaDataBundle:ItemTags')->findOneByTag($tagId);
			if(isset($tag))
			{
				$em->remove($tag);
				$em->flush();
			}
		}

		return ResponseHelper::encodeAndGetJsonResponse($item);
    }
**/
	// put_collections_items   PUT    /api/collections/{project_id}/items.{_format}
    public function putItemsAction($item_id)
    {
        $em = $this->getDoctrine()->getEntityManager();

        $request = $this->getRequest();
        $request_data = $this->getRequest()->request;        
        
		$item = $em->getRepository('ZeegaDataBundle:Item')->find($item_id);

        if (!$item) 
        {
            throw $this->createNotFoundException('Unable to find the Item with the id ' + $item_id);
        }

		$title = $request_data->get('title');
		$description = $request_data->get('description');
        $tags = $request_data->get('tags');
		$tags = $request_data->get('tags');
		$creator_username = $request_data->get('media_creator_username');
		$creator_realname = $request_data->get('media_creator_realname');
		$media_geo_latitude = $request_data->get('media_geo_latitude');
		$media_geo_longitude = $request_data->get('media_geo_longitude');
        
		if(isset($title)) $item->setTitle($title);
		if(isset($description)) $item->setDescription($description);
		if(isset($creator_username)) $item->setMediaCreatorUsername($creator_username);
		if(isset($creator_realname)) $item->setMediaCreatorRealname($creator_realname);
		if(isset($media_geo_latitude)) $item->setMediaGeoLatitude($media_geo_latitude);
		if(isset($media_geo_longitude)) $item->setMediaGeoLongitude($media_geo_longitude);

        $em = $this->getDoctrine()->getEntityManager();
        $em->persist($item);
        $em->flush();
        
        $itemView = $this->renderView('ZeegaApiBundle:Items:show.json.twig', array('item' => $item));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);       
    }
    
    // put_collections_items   PUT    /api/collections/{project_id}/items.{_format}
    
    /**
    public function putItemsAction($item_id)
    {
        $em = $this->getDoctrine()->getEntityManager();

        $request = $this->getRequest();
        $request_data = $this->getRequest()->request;        
        
		$item = $em->getRepository('ZeegaDataBundle:Item')->find($item_id);

        if (!$item) 
        {
            throw $this->createNotFoundException('Unable to find the Item with the id ' + $item_id);
        }

		$title = $request_data->get('title');
		$description = $request_data->get('description');
        $tags = $request_data->get('tags');
		$tags = $request_data->get('tags');
		$creator_username = $request_data->get('media_creator_username');
		$creator_realname = $request_data->get('media_creator_realname');
        
		if(isset($title)) $item->setTitle($title);
		if(isset($description)) $item->setDescription($description);
		if(isset($creator_username)) $item->setMediaCreatorUsername($creator_username);
		if(isset($creator_realname)) $item->setMediaCreatorRealname($creator_realname);
		
		if(isset($tags))
		{
			$tags_list = explode(',', $tags); 
			foreach($tags_list as $tagName)
	        {
	            $tag = $em->getRepository('ZeegaDataBundle:Tag')->findOneByName($tagName);
            
	            if (!$tag) 
	            {
	                $tag = new Tag();
	                $tag->setName($tagName);
	                $tag->setDateCreated(new \DateTime("now"));
	                $em->persist($tag);
	                $em->flush();
		            $item_tag = new ItemTags;
		            $item_tag->setItem($item);
		            $item_tag->setTag($tag);
		            $item_tag->setTagDateCreated(new \DateTime("now"));

		            $em->persist($item_tag);
		            $em->flush();
	            }
        	}
		}

        $em = $this->getDoctrine()->getEntityManager();
        $em->persist($item);
        $em->flush();
        
        $itemView = $this->renderView('ZeegaApiBundle:Items:show.json.twig', array('item' => $item));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);       
    }
	**/
    // Private methods 
    
    private function populateItemWithRequestData($request_data)
    {    
        $user = $this->get('security.context')->getToken()->getUser();

        if (!$request_data) 
            throw $this->createNotFoundException('Item object is not defined.');
        
        $title = $request_data->get('title');
		$title = $request_data->get('description');
		

        $item = new Item();
        $item->setMediaType('Collection');
        $collection->setLayerType('Collection');
        $collection->setUri('http://zeega.org');
        $collection->setAttributionUri("http://zeega.org");
        $collection->setUser($user);
        $collection->setChildItemsCount(0);
        $collection->setMediaCreatorUsername($user->getUsername());
        $collection->setMediaCreatorRealname($user->getDisplayName());
        $collection->setTitle($title);
        
        if (isset($new_items))
        {
            $collection->setChildItemsCount(count($new_items));
            $first = True;
            foreach($new_items as $item)
            {
                
                $child_entity = $em->getRepository('ZeegaDataBundle:Item')->find($item);

                if (!$child_entity) 
                {
                    throw $this->createNotFoundException('Unable to find Item entity.');
                }    

                $collection->addItem($child_entity);
                if($first == True)
                {
                    $collection->setThumbnailUrl($child_entity->getThumbnailUrl());
                    $first = False;
                }
            }
        }
        
        return $collection;
    }
}