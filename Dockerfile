FROM node:20-alpine3.18
RUN mkdir -p /home/node/brints-estate-backend/node_modules && chown -R node:node /home/node/brints-estate-backend
WORKDIR /home/node/brints-estate-backend
COPY --chown=node:node package*.json ./
USER node
RUN yarn
COPY --chown=node:node . .
EXPOSE 3001
CMD [ "yarn", "start" ]