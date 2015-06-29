# Ting architecture

The ting architecture is shown in the following diagram:

![Ting architecture](http://i.imgur.com/OadTh77.jpg)

The application is split into two parts: The server-side and the client-side.
The client-side portion is in Javascript and runs on the user's machine. The
server-side portion runs on the ting servers.

# Client-side architecture
The client-side architecture follows an MVC pattern. All of these are written
in Javascript and communicate with direct function calls and shared memory.
Here are the components:

* **Model**: The model is responsible for storing the current state of the world
  and providing access to it through a programming interface. This exposes data
  such as online people, channels currently joined, and message history in
  currently active channels. The model offers publish/subscribe APIs for the
  view to interact with through callbacks for model events. The model also
  keeps track of changes that are pending and need to be communicated to the
  server, for example user messages that have been sent by the user but have
  not yet reached the server.

* **View**: The view is responsible for presenting the data to the user and for
  rendering the user interface. It uses the model's API directly to read the
  data that represents the state of the world. Furthermore, it communicates
  with the model to tell it if the user has changed something in the world
  state, for example if the user has sent a message.

* **Controller**: The controller provides a thin layer that talks to the server
  and speaks its API. It is aware of the RESTful API end-points and data
  formats, as well as the web-socket protocol for real-time communication. The
  controller provides a publish/subscribe API for the model and offers an API
  that allows the model to send data to the server reliably.

# Server-side architecture
The server-side architecture is split into two portions: The real-time service
and the RESTful API service.

The real-time service is written in node.js and provides a web-socket end-point
that the client directly talks to. The real-time protocol allows exchanging data
such as currently online users and messages being currently exchanged.

The RESTful API service is written in Python using the Django framework. It
offers an HTTPS end-point that is used to manage users, history, and channels.

The client also talks to the RESTful API directly for non-real-time operations.
Such operations include the retrieval of message history for a given channel,
or profile information about a particular user.

The real-time service also communicates internally with the RESTful API
service. This is so that real-time data can be persisted over time. This
communication happens using a RESTful HTTPS protocol, where the real-time
service hits the URLs of the RESTful service. As an example of one such
operation, consider the persistence of chat messages.
