# Build stage
FROM golang:1.24.3 AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /focus-flare-backend

# Run stage
FROM alpine:latest
WORKDIR /
COPY --from=builder /focus-flare-backend /focus-flare-backend
COPY .env .env
EXPOSE 8090
CMD ["/focus-flare-backend"]