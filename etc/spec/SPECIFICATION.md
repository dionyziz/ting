# Ting

June 15, 2015 - July 12, 2015

dionyziz for the Ting team.

Ting is a chat platform. It runs on ting.gr. This document specifies how it works.

# Workflow
People on ting exchange messages. Messages can be exchanged either in channels (known as "tings"), or privately. Channels are public and can be joined by anyone, where they can see the messages exchanged. Privates are messages exchanged directly between two people and can only be viewed by these people.

Ting consists of two screens: The login screen and the chat screen. These are
described below. When the user enters the URL ting.gr on their browser, they
are taken to the Login screen. If they enter www.ting.gr, they are redirected
to ting.gr and appropriate URL parameters are appended.

When the user enters the URL ting.gr/channel, where channel is any
valid channel name, the user is taken to the Login screen with the active
conversation set to the channel specified in the URL. When the user enters
the URL ting.gr/u/user, where user is any valid user name, the user is taken
to the Login screen with the active conversation set to a private with the
user specified.

The active conversation remains
until the web page is refreshed, a different URL is visited, or the active
channel is manually changed. When the active conversation is changed, the URL
is changed to reflect that.

The user visits a ting URL and enters a channel. They can then see who is online
on the platform.

The users can exchange messages in multiple channels. Messages exchanged are per-channel. Each message sent to a channel is delivered only to the selected channel.

Message history is stored in a per-channel basis. When a user makes a channel
active, they are shown some of the messages history.

Users can also exchange data in private. Private messages constitute messages
that are exchanged between two users directly and only they can see. Channels
and privates are collectively known as conversations.

# Channels
If no channel name is specified in the URL, the default channel name is used,
which is the channel name "ting". Channel names are validated as follows upon
visiting a ting URL:

1. The channel name is at least 1 character and at most 20.
2. The channel name must consist of only the following characters:
 - The lower-case and upper-case latin characters a-z and A-Z.
 - The numbers 0-9.
 - The symbols _ . -

If an invalid channel is specified, the user is redirected to the default
channel and the URL shown is ting.gr without a channel name. The same applies
if an invalid username is specified.

There is no user notion of creating or destroying a channel. A channel is
an entity as long as some user is in it.

# UX foundation
The UX is in Greek. The text towards the user will be informal. Singular
form is used for everything. Informal words are preferred over formal words.
For example, the word "πληκτρολόγησε" should be replaced by "γράψε". The goal
is to make the user feel at ease, relaxed, and in a friendly environment.

# Target audience
The target audience for Ting is teenagers from Greece aged 12 - 21 years old.
The purpose of the chat is to bring people close together and allow strangers
who live in the same country and are of similar age to get to know each other.
We should make it a point in the UX to avoid the purpose of many other chat
rooms which is romantic or sexual interest, and focus on directing the user to
make friendly, public conversations.

# Login screen
The Login screen consists of only a modal window with the heading "Ting", a
textbox and a button.

![Login screen](http://i.imgur.com/FKcFIzW.jpg)

The placeholder text in the textbox is "Γράψε ένα ψευδώνυμο". The textbox is
focused by default when the screen is visited. The placeholder text is hidden
when the user starts typing some text, unless the text is cleared. Pressing the
Enter key when the keyboard is focused on the textbox is equivalent to pressing
the button.

The button has the text "Μπες". Upon clicking the button, the username entered
is verified as follows:

1. The username is at least 1 character and at most 20.
2. The username must consist of only the following characters:
 - The lower-case and upper-case latin characters a-z and A-Z.
 - The lower-case and upper-case greek characters α-ω and Α-Ω.
 - The numbers 0-9.
 - The symbols . , / ? ~ ! @ # $ % ^ & * ( ) - _ = + [ ] { } \ | ' " ` ; :
3. The username must not be currently in use.

All usernames are not in use by default. If the username is valid, the
username becomes in use and the user is taken to the Chat screen. The username
is then associated with that user. The username stops being in use when the
user exits the chat application by closing the browser window or by losing
their internet connection.

If the username is invalid, the textbox border is changed to red and the
content text color is changed to red and an appropriate error is displayed as
follows:

1. If the username field is empty, the error message is "Γράψε ένα ψευδώνυμο."
2. If the username field is too large, the error message is "Το ψευδώνυμο
   πρέπει να είναι έως 20 γράμματα."
3. If the username field contains forbidden characters, the error message is
   "Το ψευδώνυμο πρέπει να περιλαμβάνει μόνο γράμματα, αριθμούς ή σύμβολα."
4. If the username is currently in use, the error message is "Το ψευδώνυμο
   το έχει άλλος."

The error message is displayed above the textbox.

# Chat screen
The chat screen consists of the following elements:

1. A top bar
2. A recent conversations list
3. A chat history
4. A message area

![Chat screen](http://i.imgur.com/ASUdKzG.jpg)

The top bar is located at the top and takes up the whole screen horizontally.
On the top left, it has the text "ting".

Below it, the screen is split in two
areas vertically. The left area contains the recent list and the right area is
split horizontally in two smaller areas. The top portion is the larger and is
the chat history. The bottom portion is the message area. The portions are not
resizable. If the active conversation is a private message, there is an additional area above the message area, the user information area.

The recent list contains a list of recently used channels and recently accessed
private message partners. Recent conversations are shown from most recent to least
recent, one below the other. There is one currently active conversation at a time. That conversation is
shown at the top of the recent conversation list. Recent conversations that are channels simply display the channel name. Recent conversations that are privates display the person's avatar, their name, and their online status. The online status is displayed with a green dot on the right of their name in case they are online.

If the list of conversations is too long to fit, a vertical scrollbar is displayed on
the right-hand side of the nick list.

At the top of the recent conversations list is a searchbox. The searchbox allows
the user to type in order to filter items from the recent conversation list. When
no text is entered in the search box, the text box has the placeholder text
"Βρες ανθρώπους ή tings". As soon as the user starts typing, the placeholder
text disappears unless they clear their text. While there is text in the search
textbox, an "X" is shown at the right of the textbox, which allows the user to
clear their search text. While typing, the recent conversations list is filtered
by the search text through a prefix-match test.

The currently active conversation is shown highlighted at the top of the recent
conversation list. Recent conversations are reordered only by reactivating them:
They are not reordered by receiving messages in them or sending messages in them.

Conversations with unread messages are also highlighted, but in a different color.
Unread messages are any messages of user-interest which have not been viewed by
the user yet. Activating a conversation with unread messages marks their messages
as read. Messages of user-interest are defined as any received message in a private
conversation, or any message mentioning the user's name in a channel.

The message history contains a list of messages posted by everyone in the active
conversation. The messages are displayed in chronological order from top to bottom. When
the user enters a conversation, the message history consists of the most recent 100
messages exchanged by the users priorly and is stored on the server.

Each message posted has the following form: "[avatar] [username] Message", where
username contains the username of the person making the post and Message
contains the text posted. The message is displayed in a comicbook-like bubble indicating that someone is speaking. Messages of user-interest in channels are highlighted. Messages sent and received are displayed in different style.

If a text is too long to fit in one line, it is wrapped around to the next
line. No horizontal scrollbar is ever displayed in the history area.

If there are less messages than the chat history can fit, the messages are
displayed at the top of the chat history area. Otherwise, a vertical scrollbar
is shown.

Every time a message is posted by someone, a new chat message is appended to
the bottom of the chat history area, and the area is scrolled towards the
bottom to make the new message visible. This happens unless the user has
scrolled upwards into the history enough to read older messages. In that case,
a new message being posted does not affect the scrolling position of the
history area.

For efficiency reasons, very old messages can be removed from the chat history.

The user information area is shown above the message history area in case the currently active conversation is a private. The user information area shows the partner's avatar and username.

The message area is a textbox. The textbox is focused by default when the user
enters the Chat screen. The textbox has the placeholder "Γράψε ένα μήνυμα...".
When the user starts typing some text, the placeholder is hidden, unless the
text the user entered is deleted, in which case the placeholder text reappears.
If a user enters a long message, the text is wrapped within the textbox.
Horizontal scrollbars never appear in the message area.

When a user enters a non-empty message and presses the Enter key, the message
is sent. There is no separate button to send a chat. When a message is sent by
a user, it is delivered to everyone else who is currently online in the chat
in the active channel. The textbox in the message area is then cleared, but remains
focused. The message appears immediately on the side of the sending party.

# Typing
Ting provides a different approach from usual chat platforms when it comes to
notifications about typing. Users can see each other typing in real time. This
works as follows.

Messages in ting are separated into persistent and non-persistent. Persistent
messages are messages that have been sent. Non-persistent messages are messages
that are currently being typed, but have not been sent yet (the Enter key has
not been pressed by the user.) Users can see both persistent and non-persistent
messages and both are communicated on the network in real time.

When a user starts typing a message in a channel, they reserve a position in
the channel's history. Figuring out this position is critical for a smooth user
experience and is determined by the following rules.

* This position is maintained among other people who are currently typing, as
well as persistent messages that have been sent. When nobody is typing and a
user starts typing, this position becomes the end of the existing persistent
messages.

* When several users are typing and a user starts typing, their position becomes
at the end among the existingly typing users and after all persistent messages.

* When a user stops typing and erases their typed message, their position is
lost and their message is not persisted.

* When a user makes a message persistent by hitting the enter key, that
message's position in the history remains as-is among other users who are
typing. That is, it is not posted at the end of persistent messages, but
potentially among messages that have not yet been made persistent yet.

The user interface for this algorithm is different depending on whether the
current user or a remote user is typing. The non-persisted message of the
current user is displayed as "..." in the history portion of the chat. The full
message is displayed in the textarea as it is being typed. The "..." servers to
indicate to the user their current position among other typing users. Remote
non-persistent messages are displayed by the text being added in real time as
the user types, in their designated location.

Non-persistent messages are differentiated from persistent messages by showing
them as "ghosts", in a more transparent color. Additionally, the text of a
non-persistent message is slowly flashing by becoming more and less trasparent
to indicate that the message is ephemeral and currently changing.

# Security
For transport security purposes, ting.gr is served over HTTPS.

# TODO
This specification is limited. It will be extended with the following features in future editions:

* Username registration
* Avatars
* Age / sex / location
* Voice
* Channel moderation
* Subscription to channels
