To run server, open up terminal and type (in server terminal): 
cd server
node --env-file=config.env server
## note it will take some time depending on your wifi
## if error code 80 is obtained, it might be your ip is not whitelisted in MongoDB

Then, type (in client terminal): 
cd client
npm run dev