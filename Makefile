.PHONY: deps start open stop kill logs restart shell test

UNAME_S := $(shell uname -s)
ROOT_NAME := $(shell basename $(shell pwd))
BOOT2DOCKER_IP := $(shell boot2docker ip 2> /dev/null)
DOCKER_VERSION := $(shell docker version 2> /dev/null)
DOCKER_COMPOSE_VERSION := $(shell docker-compose version 2> /dev/null)
DOCKER_DOES_NOT_WORK := $(shell (docker info 1> /dev/null) 2>&1|grep -v WARNING)

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
ifndef DOCKER_VERSION
	@echo "ERROR: You need to install Docker first. Exiting."
	exit 1
endif
ifndef DOCKER_VERSION
	@echo "ERROR: You need to install docker-compose first. Exiting."
	exit 1
endif
ifdef DOCKER_DOES_NOT_WORK
	@echo "ERROR: Docker is not installed correctly."
	@echo "You may need boot2docker on OSX, or to start the docker service on Linux."
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
