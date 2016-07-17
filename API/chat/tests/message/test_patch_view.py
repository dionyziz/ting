
from chat.tests.message.common import *

class MessageViewPATCHTests(ChatTests):
    client_class = ChatClient

    def patch_and_get_response(self, messageid, message_content, timestamp, typing, message_type):
        """
        Patches a message on chat:message and returns the response
        """
        qstring = urllib.urlencode({
            'message_content': message_content,
            'datetime_sent': timestamp,
            'typing': typing,
            'message_type': message_type
        })
        return self.privileged_operation(
            reverse('chat:message', args=(messageid,)),
            qstring,
            'patch'
        )

    def test_patch_message(self):
        """
        The view should update the message according to the
        data provided and respond with a 204(No Content) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        response = self.patch_and_get_response(
            messageid=message.id,
            message_content='Message Updated',
            timestamp=timestamp + 10,
            typing=False,
            message_type='text'
        )

        messages = Message.objects.filter(username='vitsalis')

        self.assertTrue(messages.exists())
        self.assertEqual(len(messages), 1)
        self.assertEqual(response.status_code, 204)

        self.assertEqual(messages[0].message_content, 'Message Updated')
        self.assertEqual(datetime_to_timestamp(messages[0].datetime_start), timestamp)
        self.assertEqual(datetime_to_timestamp(messages[0].datetime_sent), timestamp + 10)
        self.assertEqual(messages[0].username, 'vitsalis')
        self.assertFalse(messages[0].typing)

    def test_patch_message_second_time(self):
        """
        The view should not update a message that has been
        made persistent. Instead it should respond with a
        400(Bad Request) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        self.patch_and_get_response(
            messageid=message.id,
            message_content='Message Updated',
            timestamp=timestamp + 10,
            typing=False,
            message_type='text'
        )

        response = self.patch_and_get_response(
            messageid=message.id,
            message_content='Message Updated Again',
            timestamp=timestamp + 100,
            typing=False,
            message_type='text'
        )

        messages = Message.objects.filter(username='vitsalis')

        self.assertTrue(messages.exists())
        self.assertEqual(messages[0].message_content, 'Message Updated')

        self.assertEqual(response.status_code, 400)

    def test_patch_message_with_datetime_sent_before_datetime_start(self):
        """
        When the datetime_sent is before datetime_start the view
        should make the datetime_sent equal to the datetime_sent,
        save the message and respond with a 204(No Content) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        response = self.patch_and_get_response(
            messageid=message.id,
            message_content='Message Updated',
            timestamp=timestamp - 1,
            typing=False,
            message_type='text'
        )

        dbmessage = Message.objects.get(pk=message.id)

        self.assertEqual(response.status_code, 204)

        self.assertEqual(dbmessage.message_content, 'Message Updated')
        self.assertTrue(hasattr(dbmessage, 'datetime_sent'))
        self.assertEqual(dbmessage.datetime_sent, message.datetime_start)
        self.assertEqual(dbmessage.datetime_sent, dbmessage.datetime_start)
        self.assertEqual(datetime_to_timestamp(dbmessage.datetime_start), timestamp)
        self.assertFalse(dbmessage.typing)

    def test_patch_message_without_text(self):
        """
        When the text is not specified the view
        should not patch the message and respond with a
        400(Bad Request) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        qstring = urllib.urlencode({
            'datetime_sent': timestamp + 10,
            'typing': False
        })

        response = self.privileged_operation(
            reverse('chat:message', args=(message.id,)),
            qstring,
            'patch'
        )

        dbmessage = Message.objects.get(pk=message.id)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(dbmessage.message_content, message.message_content)
        self.assertIsNone(dbmessage.datetime_sent)

    def test_patch_message_without_datetime_sent(self):
        """
        When the datetime_sent is not specified the view
        should not patch the message and respond with a
        400(Bad Request) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        qstring = urllib.urlencode({
            'message_content': 'Message Updated',
            'typing': False
        })

        response = self.privileged_operation(
            reverse('chat:message', args=(message.id,)),
            qstring,
            'patch'
        )

        dbmessage = Message.objects.get(pk=message.id)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(dbmessage.message_content, message.message_content)
        self.assertIsNone(dbmessage.datetime_sent)
