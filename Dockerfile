FROM node:20-alpine3.18

# create app directory
RUN mkdir -p /home/node/brints-estate-backend/node_modules && chown -R node:node /home/node/brints-estate-backend
WORKDIR /home/node/brints-estate-backend

# copy package.json and yarn.lock files
COPY --chown=node:node package*.json ./

# switch to non-root user
USER node

# install dependencies
RUN yarn

# copy source files
COPY --chown=node:node src ./src

# Build TypeScript files
RUN yarn build

# expose port
EXPOSE 3001

# start the app
CMD [ "yarn", "start" ]