FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy prebuilt jar directly
COPY app.jar app.jar

# Create uploads directory for student/tutor file storage
RUN mkdir -p uploads

# Expose default port
EXPOSE 8080

# Run with memory constraint suitable for free tier 512MB RAM
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
