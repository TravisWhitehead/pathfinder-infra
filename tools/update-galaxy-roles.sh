#!/bin/bash

REQUIREMENTS_FILE=requirements.yml
ROLES_DIR=galaxy_roles

mkdir $ROLES_DIR

ansible-galaxy install -r $REQUIREMENTS_FILE -p $ROLES_DIR -v -f
