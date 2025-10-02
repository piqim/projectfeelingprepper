To run server, open up terminal and type (in server terminal): 
cd server
node --env-file=.env server
## note it will take some time depending on your wifi
## if error code 80 is obtained, it might be your ip is not whitelisted in MongoDB

Then, type (in client terminal) to run frontend client: 
cd frontend .. (cd .. / if you need to back out)
npm run dev