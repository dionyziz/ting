# Ting architecture

The ting architecture is shown in the following diagram:

![Ting architecture](http://i.imgur.com/AdTsVNY.jpg)

The application is split into two parts: The server-side and the client-side.
The client-side portion is in Javascript and runs on the user's machine. The
server-side portion runs on the ting servers.

# Client-side architecture
The client-side architecture is built using
[react](http://facebook.github.io/react/).

There are several react components on the client-side. The Ting component is of
significance, because it is responsible for networking with the server-side of
the ting application. The Ting component uses web sockets to communicate with
the real-time portion of the server and AJAX to communicate with the API
portion of the server.

The rest of the components are agnostic in regards to networking, and are able
to communicate with the server only through the Ting component.

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

* `message`: Sends a message from the user to a channel or to another user
  directly. Takes three parameters:

  1. `type`: A string which is either `channel` or `user`, indicating whether
     the recipient of the message is a channel or a user.
  2. `target`: The name of the channel or the user we wish to send the message
     to.
  3. `text`: The text of the message.

* `start-typing`: Indicates that a user started typing a new message. Expects
  the following parameters:

  1. `type`: A string which is either `channel` or `user`.
  2. `target`: The name of the channel or the user we wish to send the message
     to.
  3. `text`: The text of the message typed so far.

* `typing-update`: Sends an update on the message that is being typed. Expects
  a `messageid` parameter indicating the id of the message that is being updated
  and a `text` parameter indicating the updated text of the message.

The server can publish the following messages:

* `login-response`: Indicates if a user logged in on the server. It includes
  two parameters. The `success` parameter which is a boolean that indicates 
  if the log in procedure succeded. The second parameter is a string called `error` 
  in case the log in failed and describes the error that occured, otherwise it
  is called `people` and is an array of strings which are usernames that are 
  online the time that the user logged in.

* `join`: Indicates a user is now online. Includes one parameter, the
  `username`. This message is also sent back to the user who
  has attempted to login if it was successful. All users online
  receive the join message for every user that goes online.

* `part`: Indicates a user is now offline. Includes the `username`.
  This message is sent to all online users when another user's connection
  is dropped or they go offline.

* `message`: Indicates a user has messaged in a channel you are in or in a private
  window. Includes four parameters, `username`, `type`, `target`, and `text`,
  as per above. If `type` is set to `user`, then `target` must be your username.

* `start-typing-response`: Indicates that the message that was sent via `start-typing`
  has been saved in the database. It includes one parameter, `messageid`, which is
  the id of the new message that is currently being typed.

* `update-typing-messages`: Indicates that the messages that are being typed are updated.
  It includes one parameter, `messages_typing`, which is a dictionary of messages.
  The dictionary of messages contains a key with its messageid for each message, whose
  value is a dictionary that describes an individual message.
  That dictionary that describes the message contains four attributes:

  1. `text`: A string which is the text of the message.
  2. `username`: A string which is the username of the user that's typing the message.
  3. `typing`: A boolean that indicates if the message is currently being typed
     or not. If this is set to false, this means that the message is now
     persistent.
  4. `datetime_start`: A unix epoch in ms which indicates the datetime the
     message started being typed.

## RESTful API

The RESTful API deals with two resources: Messages and channels. The
responses are always given in JSON. As such, we make no use of Django templates,
only models and views. The URLs of the RESTful API live under the
`https://ting.gr/api/v1` URL.

### Messages
The Messages resource is used to store and retrieve chat messages. It is
accessible through the `/messages` URL.

There are four operations:

1. A GET operation on `/messages/<type>/<target>`. This retrieves the chat
   messages recently exchanged on a channel or private. `type` is a string
   which is either `channel` or `user` and `target` is the name of the channel
   or the username.

   If `type` is `user`, then the private messages returned by this request are
   between the user making the request and the target.

   They are returned as a JSON array of messages. By default, the number of
   messages returned is limited to 100. The GET variable `lim` can be used to
   alter the limit. The messages are ordered from newest to oldest. Each
   message is represented as a dict with six keys:

   * `id`: The id of the message in the database.
   * `text`: The text of the chat message.
   * `username`: The username of the person who wrote the message. If the
     `type` was set to `user`, then this must always be equal to `target`.
   * `datetime_start`: The time the message started being typed, in UTC epoch milliseconds.
   * `datetime_sent`: The time the message was sent, in UTC epoch milliseconds.
   * `typing`: Indicates whether the message is currently being typed.
      Takes a boolean value.


2. A POST operation on `/messages/<type>/<target>`. This is a **privileged
   operation** that persists a message on a given channel or private. The POST
   body contains a dictionary with four keys, `text`, `username`,
   `datetime_start` and `typing`, with the semantics above.

3. A PATCH operation on `/messages/<channel_name>`. This is a **privileged
   operation** that updates a message on a given channel. The PATCH body
   contains a dictionary with four keys `text`, `id`, `datetime_sent`
   and `typing`, with the semantics above. `id` is used for searching, while
   `text`, `datetime_sent` and `typing` are used as the fields to update.

4. A DELETE operation on `/messages/<channel_name>`. This is a **privileged
   operation** that deletes a message on a given channel. The DELETE body
   contains a dictionary with one key `id`, with the semantics above.

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
