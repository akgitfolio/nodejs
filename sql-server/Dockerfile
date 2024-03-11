FROM postgres:latest

# Install wget
RUN apt-get update && apt-get install -y wget

# Copy the entry point script and SQL file into the container
COPY seed-northwind.sh /docker-entrypoint-initdb.d/
COPY northwind-init.sql /docker-entrypoint-initdb.d/

# Set permissions for the entry point script
RUN chmod +x /docker-entrypoint-initdb.d/seed-northwind.sh
