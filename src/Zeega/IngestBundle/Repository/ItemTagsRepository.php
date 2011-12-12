<?php

// src/Zeega/IngestBundle/Repository/ItemTagsRepository.php
namespace Zeega\IngestBundle\Repository;

use Doctrine\ORM\EntityRepository;

class ItemTagsRepository extends EntityRepository
{
    public function searchItemTags($tagId)
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

            // search query
            $qb->select('t')
               ->from('ZeegaIngestBundle:Tag', 't')
               ->innerjoin('t.item', 'i')
               ->where('i.item = ?1')
               ->setParameter(1,$tagId);
           
            // execute the query
            return $qb->getQuery()->getArrayResult();
    }
}
