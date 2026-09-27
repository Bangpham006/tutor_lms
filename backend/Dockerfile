# Multi-stage build for Spring Boot Backend
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy all backend files
COPY . .

# Build application jar skipping tests
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar from builder
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory for student/tutor file storage
RUN mkdir -p uploads

# Expose default port
EXPOSE 8080

# Run with memory constraint suitable for free tier 512MB RAM
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
