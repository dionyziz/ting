FROM gtklocker/nginx-nodejs-base:v0.0.1

RUN mkdir -p /usr/src/{app,runtime}
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY docker/front/build.sh /usr/src/runtime/

COPY client/package.json /usr/src/app/
COPY client/bower.json /usr/src/app/
RUN /usr/src/runtime/build.sh

COPY docker/front/nginx.conf /etc/nginx/conf.d/default.conf
COPY client/ /usr/src/app/
RUN gulp browserify
