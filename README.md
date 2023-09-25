# Youtube scheduler API

## What is this?
This is an API for running Youtube videos in browser so that multiple users can queue their own videos.

## How to run dev?
1. `docker-compose --env-file .env.development build api`
2. `docker-compose --env-file .env.development run api`

## How to run tests?
`docker-compose --env-file .env.test build test`
`docker-compose --env-file .env.test run test npm run test`
