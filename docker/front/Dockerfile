FROM gtklocker/nginx-nodejs-base:v0.0.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY client/package.json /usr/src/app/
RUN JOBS=MAX npm install

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY client/bower.json /usr/src/app/
RUN bower --allow-root install

COPY docker/front/nginx.conf /etc/nginx/conf.d/default.conf
COPY client/ /usr/src/app/
RUN gulp browserify
