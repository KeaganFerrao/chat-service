## Future Work:

1. Add multiple-tenant support. Each new tenant can have the option to specify its database. (Can share a database or use a new database all together)

2. Abstract file I/O operations so that we can support multiple file systems (Local/Cloud).

3. Abstract API authentication so that we can support multiple authentication stratergies.

4. Add suport to run the service in multiple nodejs clusters to share websockets connections for load balancing.

5. Impove folder structure.

6. Add user management APIs.

7. Add tenant management APIs.

8. Write Unit/integration/e2e tests.