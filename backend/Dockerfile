FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY app.jar app.jar
RUN mkdir -p uploads
EXPOSE 8080
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC -Djava.net.preferIPv4Stack=true"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
