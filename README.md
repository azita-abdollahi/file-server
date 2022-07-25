## Uploading Files to `MongoDB` with `GridFS` and `Multer` Using `NodeJS`, `Nginx` (web server)  and `mongo-express`(Web-based MongoDB admin interface, written with Node.js and express)



[`GridFS`](https://www.mongodb.com/docs/manual/core/gridfs/) is a specification that describes how to split files into chunks during storage and reassemble them during retrieval. The driver implementation of `GridFS` manages the operations and organization of the file storage.

You should use `GridFS` if the size of your file exceeds the BSON-document size limit of 16 megabytes.

`GridFS` organizes files in a **bucket**, a group of MongoDB collections that contain the chunks of files and descriptive information. Buckets contain the following collections, named using the convention defined in the `GridFS` specification:

- The `chunks` collection stores the binary file chunks.
- The `files` collection stores the file metadata.

When you create a new `GridFS` bucket, the driver creates the `chunks` and `files` collections, prefixed with the default bucket name `fs`, unless you specify a different name.

​	![](C:\Users\AZITA\Pictures\GridFS-upload.png)

​	Image source: mongodb.com

Using this packages:

- [`Mongoose`](https://mongoosejs.com/docs/) (This package will translate the node.JS code to MongoDB)
- [`Config`](https://www.npmjs.com/package/config) (It lets you define a set of default parameters, and extend them for different deployment environments.
- [`Express`](https://www.npmjs.com/package/express) (You’ll need this package for any HTTP requests you want to run)
- [`BodyParser`](https://www.npmjs.com/package/body-parser) (This package lets you receive content from HTML forms)
- [`Multer`](https://www.npmjs.com/package/multer) (This package enables easy file upload into MongoDB
- [`Gridfs-stream`](https://www.npmjs.com/package/gridfs-stream) (Easily stream files to and from MongoDB [`GridFS`](http://www.mongodb.org/display/DOCS/GridFS).)
- [`Multer-gridfs-storage`](https://www.npmjs.com/package/multer-gridfs-storage) (You need this package to implement the MongoDB `GridFS` feature with `multer`).

`docker-compose.yml`:

```yaml
version: "3"
services:
  backend-file-server:
    image: file-server
    container_name: file-server
    build:
      context: .
    restart: on-failure
    depends_on: 
      - mongodb
    networks:
      - file-net
  mongodb:
    image: mongo:4.2
    container_name: mongodb
    restart: on-failure
    env_file: ./mongo_env
    volumes: 
      - ./mongo-data:/data/db
    networks:
      - file-net
  mongo-express:
    image: mongo-express:0.54.0
    container_name: mongo-express
    depends_on:
      - mongodb
    networks:
      - file-net
    env_file: ./mongo-express_env 
  nginx:
    image: nginx:1.21
    container_name: proxy_server
    restart: on-failure
    depends_on:
      - backend
    networks:
      - file-net
    ports:
      - "8080:8080"
      - "8081:8081"
    volumes:
      - ./conf.d/:/etc/nginx/conf.d/
networks:
  file-net:
```

`Dockerfile`:

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Run application:
*Note*: This instruction uses 'docker compose' version 2.

```shell
# Start Services
docker compose up -d --build
# Stop Services
docker compose down
# All Services Logs
docker compose logs -f
# Log a Specific Service
docker compose logs -f <Service_Name>
```

