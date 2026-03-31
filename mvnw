#!/bin/sh
# Maven Wrapper startup script for Unix-like systems

# Find java
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/bin/java" ] ; then
        JAVACMD="$JAVA_HOME/bin/java"
    else
        echo "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME"
        exit 1
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || {
        echo "ERROR: JAVA_HOME is not set and no 'java' command could be found."
        echo "Please set the JAVA_HOME variable to match your Java installation."
        exit 1
    }
fi

WRAPPER_JAR="$(dirname "$0")/.mvn/wrapper/maven-wrapper.jar"
WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
MAVEN_PROJECTBASEDIR="$(dirname "$0")"

# Download wrapper jar if needed
if [ ! -f "$WRAPPER_JAR" ]; then
    echo "Downloading Maven Wrapper..."
    mkdir -p "$(dirname "$WRAPPER_JAR")"
    if command -v curl >/dev/null 2>&1; then
        curl -sS -o "$WRAPPER_JAR" "$WRAPPER_URL"
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O "$WRAPPER_JAR" "$WRAPPER_URL"
    else
        echo "ERROR: Cannot download maven-wrapper.jar. Install curl or wget."
        exit 1
    fi
fi

# If wrapper jar exists, use it
if [ -f "$WRAPPER_JAR" ]; then
    exec "$JAVACMD" \
        -Dmaven.multiModuleProjectDirectory="$MAVEN_PROJECTBASEDIR" \
        $MAVEN_OPTS \
        -classpath "$WRAPPER_JAR" org.apache.maven.wrapper.MavenWrapperMain "$@"
else
    # Fallback: try using mvn directly
    MAVEN_HOME="$HOME/.m2/wrapper/dists/apache-maven-3.9.6"
    if [ ! -d "$MAVEN_HOME" ]; then
        echo "Downloading Maven 3.9.6..."
        mkdir -p "$HOME/.m2/wrapper/dists"
        TMP_ZIP="/tmp/maven-3.9.6.zip"
        curl -sS -o "$TMP_ZIP" "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
        unzip -q "$TMP_ZIP" -d "$HOME/.m2/wrapper/dists"
        rm "$TMP_ZIP"
    fi
    exec "$MAVEN_HOME/bin/mvn" "$@"
fi
