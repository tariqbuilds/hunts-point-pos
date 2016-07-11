FROM docker.io/node:4-onbuild
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install -g bower --save
RUN mkdir bower_components && touch .npmrc
COPY ./ /usr/src/app
RUN bower install --allow-root
RUN chown -R 1001:1001 /usr/src/app
USER 1001
EXPOSE 80
