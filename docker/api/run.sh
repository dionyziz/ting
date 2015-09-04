#!/bin/bash
LOOP_LIMIT=60
for (( i=0 ; ; i++ )); do
    if [ ${i} -eq ${LOOP_LIMIT} ]; then
        echo "=> Could not connect to the db container. Shutting down."
        exit 1
    fi
    echo "=> Waiting for the db container to start up, trying ${i}/${LOOP_LIMIT}..."
    sleep 1
    mysql -hdb -uroot -pting -e "status" > /dev/null 2>&1 && break
done

python manage.py migrate
python manage.py shell < /usr/src/runtime/create-default-channels.py
python manage.py runserver 0.0.0.0:8000
