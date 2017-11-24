FROM node:alpine 

# setup the app directory
ENV appdir=/usr/service_a/
RUN mkdir -p ${appdir}
WORKDIR ${appdir} 

# copy files
COPY *.js *.json ${appdir} 

# build/install app
RUN npm install --production

# run the application
CMD node index.js
