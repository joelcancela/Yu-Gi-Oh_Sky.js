FROM httpd:2.4
COPY ./favicon.ico ./index.html /usr/local/apache2/htdocs/
COPY ./css /usr/local/apache2/htdocs/css
COPY ./img /usr/local/apache2/htdocs/img
COPY ./js /usr/local/apache2/htdocs/js