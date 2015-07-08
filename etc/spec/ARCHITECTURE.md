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

The communication between the real-time service and the RESTful API is
privileged: The privileges of the real-time service are elevated so that
it can provide authoritative data to the RESTful API. Authentication for
this is performed by providing a shared secret in every request.

## Real-time API

The real-time API deals with maintaining the state of who is online and performs
message exchange. Communication happens using socket.io. The messages that can
be sent to the server are the following:

* `login`: Indicates that a user is logging in on the server by providing the
  user information. Requires a `username` parameter. If the username is
  invalid, the server will close the connection.

* `join`: Indicates the user wishes to join a channel. Expects a `channel`
  parameter indicating the channel name.

* `part`: Indicates the user wishes to leave a channel. Expects a `channel`
  parameter.

* `message`: Sends a message from the user to a channel or to another user
  directly. Takes three parameters:

  1. `type`: A string which is either `channel` or `user`, indicating whether
     the recipient of the message is a channel or a user.
  2. `target`: The name of the channel or the user we wish to send the message
     to.
  3. `text`: The text of the message.

The server can publish the following messages:

* `join`: Indicates a user has joined a channel. Includes two parameters, the
  `username` and the `channel`. This message is also sent back to the user who
  has attempted to join a channel if it was successful. All users present in a
  channel receive the join message for every user that joins that channel.

* `part`: Indicates a user has parted a channel. Includes the `username` and
  `channel`. This message is also sent back to the user who attempted to part
  a channel. All users in a channel receive part messages for users leaving the
  channel. If a user's connection is dropped, part messages are sent for all
  the channels they were in.

* `channel`: This message is sent to a user who has just joined a channel. It
  includes one parameter, `participants`, which is an array with all the
  usernames of the people who are currently online in the channel.

* `message`: Indicates a user has messaged in a channel you are in or in a private
  window. Includes four parameters, `username`, `type`, `target`, and `text`,
  as per above. If `type` is set to `user`, then `target` must be your username.

## RESTful API

The RESTful API deals with two resources currently: Messages and channels. The
responses are always given in JSON. As such, we make no use of Django templates,
only models and views. The URLs of the RESTful API live under the
`https://ting.gr/api` URL.

### Messages
The Messages resource is used to store and retrieve chat messages. It is
accessible through the `/messages` URL.

There are two operations:

1. A GET operation on `/messages/<channel_name>`. This retrieves the chat
   messages recently exchanged on a channel. They are returned as a JSON array
   of messages. By default, the number of messages returned is limited to 100.
   The GET variable `lim` can be used to alter the limit. The messages are
   ordered from newest to oldest. Each message is represented as a dict with
   three keys:

   * `text`: The text of the chat message.
   * `username`: The username of the person who wrote the message.
   * `datetime`: The time the message was sent, in UTC epoch milliseconds.

2. A POST operation on `/messages/<channel_name>`. This is a **privileged
   operation** that persists a message on a given channel. The POST body
   contains a JSON dictionary with three keys, `text`, `username`, and
   `datetime`, with the semantics above.

### Channels
The Channels resource is used to create and retrieve channel information.
It is accessible through the `/channels` URL.

There are two operations:

1. A GET operation on `/channels/<channel_name>`. This retrieves information
   about a given channel. If the channel does not exist, it causes a 404 error
   code. Otherwise, a JSON dict with a description of the channel is returned.
   It contains only a single key, `name`, with its value set to the channel
   name.

2. A POST operation on `/channels`. This creates a new channel with the given
   name. The POST body contains a dictionary with one key, "name", which
   contains the name of the channel.
