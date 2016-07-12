from chat.tests.message.common import *

class MessageModelTests(ChatTests):
    def test_message_create(self):
        """
        A message must be saved correctly in the database.
        """
        message = create_message(
            message_content='Message',
            timestamp=10 ** 11,
            username='vitsalis',
            channel=self.channel,
            message_type='text'
        )

        messages = Message.objects.filter(pk=message.id)

        self.assertTrue(messages.exists())
        self.assertEqual(messages.count(), 1)

        dbmessage = messages[0]

        self.assertEqual(dbmessage.message_content, message.message_content)
        self.assertEqual(dbmessage.datetime_start, message.datetime_start)
        self.assertEqual(dbmessage.username, message.username)
        self.assertEqual(dbmessage.channel.id, message.channel.id)
        self.assertTrue(dbmessage.typing)

        link = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAAG1BMVEX///8AAACdnZ3X19eZmZnq6ur7+/vOzs7x8fHjK9NyAAAARElEQVRoge3NiQmAMBAAsNrr4/4TC9YNlBNKskBKAT42W7317LgdS2THVSzeLu6xnCN7foy/YgAAAAAAAAAAAAAAgJcuaoEAp2NAe+UAAAAASUVORK5CYII='

        message = create_message(
            message_content=link,
            timestamp=10 ** 11,
            username='vitsalis',
            channel=self.channel,
            message_type='image'
        )

        messages = Message.objects.filter(pk=message.id)

        self.assertTrue(messages.exists())
        self.assertEqual(messages.count(), 1)

        dbmessage = messages[0]

        self.assertEqual(dbmessage.message_content, message.message_content)
        self.assertEqual(dbmessage.datetime_start, message.datetime_start)
        self.assertEqual(dbmessage.username, message.username)
        self.assertEqual(dbmessage.channel.id, message.channel.id)
        self.assertTrue(dbmessage.typing)

