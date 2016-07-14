FROM library/node:latest
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
COPY bower.json  /usr/src/app/bower.json
RUN npm install
RUN npm install -g bower --save
RUN bower install --allow-root
COPY ./ /usr/src/app
RUN chown -R 1001:1001 /usr/src/app
USER 1001
EXPOSE 8080
CMD npm start
