FROM node

RUN mkdir -p /usr/src/{app,config,runtime}
WORKDIR /usr/src/app

COPY docker/realtime/build.sh /usr/src/runtime/

COPY realtime/package.json /usr/src/app/
RUN /usr/src/runtime/build.sh

EXPOSE 8080

COPY docker/config/common.json /usr/src/config/
COPY realtime/ /usr/src/app/
CMD ["node", "server.js"]
