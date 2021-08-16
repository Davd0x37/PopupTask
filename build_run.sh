#! /bin/bash

docker build -t popup_app .

docker run -p 80:80 -t popup_app