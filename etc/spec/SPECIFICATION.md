==Ting==

June 15, 2015
dionyziz

Ting is a chat platform. It runs on ting.gr. This document is the specification
for the minimum viable product version of Ting. We will develop this version on
June 15, 2015 and launch it in public on the same day. We will then reiterate
and develop more complicated features and extend this specification to expand
the platform.

==Workflow==
Ting consists of two screens: The login screen and the chat screen. These are
described below. When the user enters the URL ting.gr on their browser, they
are taken to the Login screen. If they enter www.ting.gr, they are redirected
to ting.gr.

==UX foundation==
The UX is in Greek. The text towards the user will be informal. Singular
form is used for everything. Informal words are preferred over formal words.
For example, the word "πληκτρολόγησε" should be replaced by "γράψε". The goal
is to make the user feel at ease, relaxed, and in a friendly environment.

==Target audience==
The target audience for Ting is teenagers from Greece aged 12 - 21 years old.
The purpose of the chat is to bring people close together and allow strangers
who live in the same country and are of similar age to get to know each other.
We should make it a point in the UX to avoid the purpose of many other chat
rooms which is romantic or sexual interest, and focus on directing the user to
make friendly, public conversations.

==Login screen==
The Login screen consists of only a modal window with the heading "Ting", a
textbox and a button.

[[login.jpg]]

The placeholder text in the textbox is "Γράψε ένα ψευδώνυμο". The textbox is
focused by default when the screen is visited. The placeholder text is hidden
when the user starts typing some text, unless the text is cleared. Pressing the
Enter key when the keyboard is focused on the textbox is equivalent to pressing
the button.

The button has the text "Μπες". Upon clicking the button, the nickname entered
is verified as follows:

1. The nickname is at least 1 character and at most 20.
2. The nickname must consists of only the following characters:
 - The lower-case and upper-case latin characters a-z and A-Z.
 - The lower-case and upper-case greek characters α-ω and Α-Ω.
 - The numbers 0-9.
 - The symbols . , / ? ~ ! @ # $ % ^ & * ( ) - _ = + [ ] { } \ | ' " ` ; :
3. The nickname must not be currently in use.

All nicknames are not in use by default. If the nickname is valid, the
nickname becomes in use and the user is taken to the Chat screen. The nickname
is then associated with that user. The nickname stops being in use when the
user exits the chat application by closing the browser window or by losing
their internet connection.

If the nickname is invalid, the textbox border is changed to red and the
content text color is changed to red and an appropriate error is displayed as
follows:

1. If the nickname field is empty, the error message is "Γράψε ένα ψευδώνυμο."
2. If the nickname field is too large, the error message is "Το ψευδώνυμο
   πρέπει να είναι έως 20 γράμματα."
3. If the nickname field contains forbidden characters, the error message is
   "Το ψευδώνυμο πρέπει να περιλαμβάνει μόνο γράμματα, αριθμούς ή σύμβολα."
4. If the nickname is currently in use, the error message is "Το ψευδώνυμο
   το έχει άλλος."

The error message is displayed above the textbox.

==Chat screen==
The chat screen consists of the following elements:

1. A top bar
2. A nick list
3. A chat history
4. A message area

[[chat.jpg]]

The top bar is located at the top and takes up the whole screen horizontally.
On the top left, it has the text "ting". Below it, the screen is split in two
areas vertically. The left area contains the nick list and the right area is
split horizontally in two smaller areas. The top portion is the larger and is
the chat history. The bottom portion is the message area. The portions are not
resizable.

The nick list contains the nicknames that are currently in use, in alphabetical
order. Nicknames are displayed one below the other. If the list of nicknames is
too long to fit, a vertical scrollbar is displayed on the right-hand side of
the nick list. Otherwise, no scrollbar is displayed.

The message history contains a list of messages posted by everyone. The
messages are displayed in chronological order from top to bottom. The message
history is empty when the user first enters the Chat screen - no history is
stored on the server.

Each message posted has the following form: "Nickname: Message", where
Nickname contains the nickname of the person making the post and Message
contains the text posted. The nickname is displayed in bold.

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

The message area is a textbox. The textbox is focused by default when the user
enters the Chat screen. The textbox has the placeholder "Γράψε ένα μήνυμα...".
When the user starts typing some text, the placeholder is hidden, unless the
text the user entered is deleted, in which case the placeholder text reappears.
If a user enters a long message, the text is wrapped within the textbox.
Horizontal scrollbars never appear in the message area.

When a user enters a non-empty message and presses the Enter key, the message
is sent. There is no separate button to send a chat. When a message is sent by
a user, it is delivered to everyone else who is currently online in the chat.
The textbox in the message area is then cleared, but remains focused. The
message appears immediately on the side of the sending party.

==TODO==
This specification is limited to a minimum viable product specification. It
will be extended with the following features in future editions:

* HTTPS
* Channels
* Private messages
* Nickname registration
* Live typing
* Avatars
* Age / sex / location
* Voice
* Channel moderation
* Subscription to channels
