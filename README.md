# tiny-url-cloudflare-assessment

> An HTTP-based RESTful API built for managing short URLs and redirecting clients. The application layer is built with [Express](https://expressjs.com/) + [Node.js](https://nodejs.org/en/) and the data layer is a [Postgres](https://www.postgresql.org/) database. Both layers are deployable as dockerized containers using `docker compose`. The app is configured be deployed locally on port 8080 (but this is configurable).

### Features

1. Create a short URL from a long URL

Endpoint: `POST /shortUrl`

Supported request body properties:

* `longUrl` - valid http/https URL
* `expiresAt` - (optional) valid ISO-formatted time greater than or equal current time

```bash
curl --location 'http://localhost:8080/shortUrl' \
--header 'Content-Type: application/json' \
--data '{
    "longUrl": "https://www.cloudflare.com/",
    "expiresAt": "2999-01-01"
}'
```

2. Redirect a short URL to a long URL.

Endpoint: `GET /:shortUrl`

Supported request parameter properties:

* `shortUrl` - short URL identifier

```bash
curl --location http://localhost:8080/<replace with short URL ID>
```

3. List the number of times a short url has been accessed in the last 24 hours (`OneDay`), past week (`OneWeek`), and all time (`AllTime`).

Endpoint: `GET /shortUrl/:shortUrl/clicks`

Supported request parameter properties:

* `shortUrl` - short URL identifier

Supported request query properties:

* `queryPeriod` - (optional) `OneDay`, `OneWeek`, or `AllTime`

```bash
curl --location 'http://localhost:8080/shortUrl/<replace with short URL ID>/clicks?queryPeriod=OneWeek'
```

4. Short URLs can be deleted.

Endpoint: `DELETE /shortUrl/:shortUrl`

Supported request parameter properties:

* `shortUrl` - short URL identifier

```bash
curl --location --request DELETE 'http://localhost:8080/shortUrl/<replace with short URL ID>'
```

5. Data persistence.

6. Logging for troubleshooting.

### Prerequisites

1. Must have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.
2. Must have [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

### Installation and deployment steps

1. Clone the project repository to your local workspace.
2. Install dependencies and build the package by running `npm install && npm run build`.
3. Deploy the API and database server with docker compose by running `docker compose up -d`.
4. Verify two docker containers are up and running with the following image names:
   - tiny-url-cloudflare-assessment-server
   - postgres

### Tests

#### Unit tests

Run `npm run test`. Coverage documentation and artifacts will be available in `./coverage/unit` afterwards.

#### Integration tests

Run `npm run test:integration` while your Postgres server is deployed and running. Note that the Postgres server should be online already if you ran `docker compose up -d` earlier. If it's not running, please start the docker container for the Postgres server before executing the integration tests.

### Assumptions made

1. A long URL can be mapped to one or more short URLs (i.e. 1:N relationship).
2. A short URL will only ever be mapped to one long URL (i.e. N:1 relationship).
3. Interacting with a short URL that has expired will return a 404 status code.
4. By default, a short URL will live forever unless an expiration date is supplied.
5. By default, the total number of clicks in the past one day will be returned for a short URL unless an explicit query period is supplied in the `GET /shortUrl/:shortUrl/clicks` endpoint.

### Design decisions

1. Database decision.

I opted to use a relational database (Postgres) over a NoSQL database (i.e. DynamoDB, MongoDB). I created two tables, `short_urls` and `click_events` to store the url relationship and total number of times/clicks a short url is accessed respectively. Using a relational database was preferred to separate all click data access patterns from short URL metadata access patterns while maintaining clear link between the two resources.

2. Table design for total number of times a short URL is accessed.

I created a separate relationship database table that creates a new record every time a short URL is accessed. The URL's identifier and the current timestamp are included in the record. Getting the total number of times a short URL is accessed in a one day, one week, or all time period is trivial with an aggregated SQL function like `SELECT COUNT(*)`.

3. Handling expired short URLs in application code.

I opted to surface any expired short URL record as "not found" to the client in the application code. When a client tries to create a new short URL where an expired entry already exists in the database, then the application code will try to delete the original entry and all corresponding click event entries first. In an idea world, expired records should be deleted by an async cron job that scans the table instead of in the application code.
