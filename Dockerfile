FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy prebuilt jar directly
COPY app.jar app.jar

# Create uploads directory for student/tutor file storage
RUN mkdir -p uploads

# Expose default port
EXPOSE 8080

# Run with memory constraint suitable for free tier 512MB RAM and enforce IPv4 for cloud database connectivity
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC -Djava.net.preferIPv4Stack=true"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
