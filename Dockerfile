# Use the Ballerina runtime image
FROM ballerina/ballerina:latest

# Set working directory in the container
WORKDIR /app

# Copy your source files
COPY . /app

# Build the Ballerina app
RUN bal build

# Expose the port your WebSocket server uses (e.g., 9090)
EXPOSE 9092 9093

# Set the default command to run your compiled Ballerina binary
CMD ["bal", "run", "target/bin/p2pchat-backend.jar"]
