# CurrentCoin Create Frontend

This is the frontend of CurrentCoin Create.

`currentcoin-create-frontend` is just one of three parts which make CurrentCoin Create work. The other parts are `currentcoin-create-backend` and `currentcoin-create-deployer`.

### To run

Make sure all submodules (nested git repositories) are ready. Clear instructions for submodules coming soon. Useful commands:

`git submodule update --recursive --init`

`git submodule foreach --recursive 'git fetch && git checkout master'`

From your local machine,

`yarn` (or `npm install`)

`yarn start` (or `npm start`)

### To deploy

This frontend is not deployed directly. This repository is included in `currentcoin-create-backend` as a submodule.

To deploy, commit and push changes to github, then pull within `currentcoin-create-backend`, and follow the deployment instructions there.
