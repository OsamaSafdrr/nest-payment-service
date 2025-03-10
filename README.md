# Payment Processing Service

This service handles payment processing with features like concurrency control, retries, and idempotency using NestJS and TypeORM with MySQL.

## Features

- **Concurrency Handling**: Ensures only one transaction per order ID at a time using database row locking.
- **Retries with Exponential Backoff**: Retries failed payments up to three times, doubling the delay each attempt.
- **Idempotency**: Prevents duplicate payments for the same order by checking existing records before processing.

## Installation

### Prerequisites

- Docker & Docker Compose

### Running the Service

1. Clone the repository:
  
2. Start the service using Docker:
   ```sh
   docker-compose up --build
   ```

3. To stop the service:
   ```sh
   docker-compose down
   ```

## API Endpoints

### Process Payment

- **Endpoint:** `POST /payments/process`
- **Request Body:**
  ```json
  {
    "order_id": "order-123",
    "amount": 100.00
  }
  ```

- **Response (Success):**
  ```json
  {
    "status": "success",
    "transaction_id": "txn-21408"
  }
  ```

- **Response (Failure after retries):**
  ```json
  {
    "error": "Payment failed after maximum retries"
  }
  ```

## Concurrency, Retries, and Idempotency

### **Concurrency Handling**

- Uses **pessimistic row locking** to prevent multiple processes from updating the same payment record simultaneously.
- If a transaction is already in progress, new requests must wait or fail.

### **Retries with Exponential Backoff**

- If the payment gateway fails, the system retries the request up to **three times**.
- The delay doubles with each attempt (e.g., 1s, 2s, 4s).

### **Idempotency Handling**

- Before processing a new payment, the system checks if an existing payment for the `order_id` is already completed.
- If completed, it prevents duplicate transactions.

## Trade-offs

- **Performance vs. Consistency**: Using pessimistic locking ensures correctness but may slow down processing during high traffic.
- **Retries vs. Gateway Load**: Multiple retries increase success rates but can put extra load on the payment gateway.
- **Exponential Backoff**: Reduces server strain but increases overall transaction time.

## Running Tests

Run tests inside the Docker container:

```sh
docker exec -it <nest-mysql> npm test
```
## Some other Commands 
docker-compose up --build
docker-compose restart app
docker logs -f nest-app


## Future Improvements

- Implementing a **queue-based retry mechanism** for better scalability.
- Using **distributed locking** for horizontal scaling.
- Optimizing **transaction handling** for better performance.

---



