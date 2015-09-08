.PHONY: deps start open stop kill logs restart shell test

UNAME_S := $(shell uname -s)
USERNAME := $(shell whoami)
IS_DOCKER_MEMBER := $(shell groups|grep docker)
ROOT_NAME := $(shell basename $(shell pwd))
BOOT2DOCKER_IP := $(shell boot2docker ip 2> /dev/null)
DOCKER_VERSION := $(shell docker version 2> /dev/null)
DOCKER_COMPOSE_VERSION := $(shell docker-compose version 2> /dev/null)
DOCKER_DOES_NOT_WORK := $(shell (docker info 1> /dev/null) 2>&1|grep -v WARNING)
DOCKER_COMPOSE_DOES_NOT_WORK := $(shell docker-compose ps 2>&1|grep "client and server don't have same version")
PORT_80_USED := $(shell netstat -lnt|awk '$$4 ~ ".80"')
PORT_8080_USED := $(shell netstat -lnt|awk '$$4 ~ ".8080"')

ifndef BOOT2DOCKER_IP
DOCKER_IP := 127.0.0.1
else
DOCKER_IP := $(BOOT2DOCKER_IP)
endif

ifeq ($(UNAME_S),Darwin)
OPEN := open
else
ifeq ($(UNAME_S),Linux)
OPEN := xdg-open
endif
endif

ifndef COMPOSE_FILE
COMPOSE_FILE := development.yml
export COMPOSE_FILE
endif

deps:
ifeq ($(UNAME_S),Linux)
ifneq ($(USERNAME),root)
ifndef IS_DOCKER_MEMBER
	@echo "ERROR: Are you in the docker group?"
	@echo "You can try:"
	@echo "    sudo usermod -aG docker $(USERNAME)"
	exit 1
endif
endif

ifdef PORT_80_USED
	@echo "ERROR: We need to bind to port 80, but something is using it. Please free it up and rerun this."
	exit 1
endif
ifdef PORT_8080_USED
	@echo "ERROR: We need to bind to port 8080, but something is using it. Please free it up and rerun this."
	exit 1
endif
endif
ifndef DOCKER_VERSION
	@echo "ERROR: You need to install Docker first. Exiting."
	exit 1
endif
ifndef DOCKER_COMPOSE_VERSION
	@echo "ERROR: You need to install docker-compose first. Exiting."
	exit 1
endif
ifdef DOCKER_DOES_NOT_WORK
	@echo "ERROR: Docker is not installed correctly."
	@echo "You may need boot2docker on OSX, or to start the docker service on Linux."
	exit 1
endif
ifdef DOCKER_COMPOSE_DOES_NOT_WORK
	@echo "ERROR: Your docker version is incompatible with your docker-compose version."
ifdef BOOT2DOCKER_IP
	@echo "You can try:"
	@echo "    brew update && brew upgrade docker boot2docker"
	@echo "    boot2docker upgrade && boot2docker up"
else
	@echo "It's recommended that you install both on the latest version."
	@echo "Remove all docker packages and docker-compose executables and consult these links:"
	@echo " https://docs.docker.com/installation/ubuntulinux/#installation"
	@echo " https://docs.docker.com/compose/install/"
endif
	exit 1
endif

build: deps $(COMPOSE_FILE)
	docker-compose build

start: deps $(COMPOSE_FILE)
	docker-compose up -d

open: deps start
	$(OPEN) "http://$(DOCKER_IP):80"

stop: deps
	docker-compose stop

kill: deps
	docker-compose kill

logs: deps
ifdef TARGET
	docker-compose logs $(TARGET)
else
	docker-compose logs
endif

restart: deps
ifdef TARGET
	docker-compose restart -t 0 $(TARGET)
else
	docker-compose restart -t 0
endif

shell: deps start
ifndef TARGET
	@echo "ERROR: 'make shell' should be used with a target."
	@echo "Example: make shell TARGET=api"
	exit 1
endif
	docker exec -it $(shell docker-compose -f $(COMPOSE_FILE) ps -q $(TARGET)) /bin/bash

test: deps start
ifndef TARGET
	@echo "ERROR: 'make test' should be used with a target."
	@echo "Example: make test TARGET=api"
	exit 1
endif
ifeq ($(TARGET),api)
	docker exec -it $(shell docker-compose -f $(COMPOSE_FILE) ps -q $(TARGET)) python manage.py test chat
else
ifeq ($(TARGET),front)
	docker exec -it $(shell docker-compose -f $(COMPOSE_FILE) ps -q $(TARGET)) npm test
else
ifeq ($(TARGET),realtime)
	docker exec -it $(shell docker-compose -f $(COMPOSE_FILE) ps -q $(TARGET)) npm test
else
	@echo "ERROR: Don't know how to test $(TARGET)."
	exit 1
endif
endif
endif
