#!/bin/bash

echo "maxmemory 1g  
maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf

redis-server