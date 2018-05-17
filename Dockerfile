# Use an official Python runtime as a parent image
FROM python:3.6.5-stretch
# FROM python:2.7-slim

# Set the working directory to /src/server
WORKDIR /src/server

# Copy the current directory contents into the container at /app
ADD . /src/server

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Copy a configuration file from the current directory
ADD nginx.conf /etc/nginx/

# Copy static files
ADD /src/client/build/ /usr/share/nginx/html/

# Make port 80 and 90 available to the world outside this container
EXPOSE 80 90

# Define environment variable
ENV NAME credit-api

# Run app.py when the container launches
CMD ["python", "server/api.py"]
