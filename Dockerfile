FROM node:20-alpine.3.18
RUN mkdir -p /home/node/brints-estate-backend/node_modules && chown -R node:node /home/node/brints-estate-backend
WORKDIR /home/node/brints-estate
COPY package*.json ./
USER node
RUN yarn install
COPY --chown=node:node . .
EXPOSE 3001
CMD [ "yarn", "start" ]