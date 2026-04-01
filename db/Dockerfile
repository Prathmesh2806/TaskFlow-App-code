FROM postgres:15-alpine

# Copy the init.sql into the directory where Postgres looks for initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Set default environment variables (can be overridden by K8s)
ENV POSTGRES_DB=taskmanager
ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password

EXPOSE 5432
