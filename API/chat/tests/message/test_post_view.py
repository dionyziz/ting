from chat.tests.message.common import *

from django.utils.dateformat import format

class MessageViewPOSTTests(ChatTests):
    def post_and_get_response(self, message_content, timestamp, username, typing, message_type):
        """
        Posts a message on chat:message and returns the response
        """
        return self.privileged_operation(
            reverse('chat:message', args=('channel', self.channel.name,)),
            {'message_content': message_content, 'username': username, 'datetime_start': timestamp, 'typing': typing, 'message_type': message_type},
            'post'
        )

    def test_post_valid_message(self):
        """
        When a valid message is sent, the view should
        save the message in the database and return
        the id of the message.
        """
        timestamp = 10 ** 11
        username = 'vitsalisa'
        message_content = 'Message'
        message_type = 'text'

        response = self.post_and_get_response(
            message_content=message_content,
            timestamp=timestamp,
            username=username,
            typing=True,
            message_type=message_type
        )

        messages = Message.objects.filter(username=username)

        self.assertTrue(messages.exists())
        self.assertEquals(len(messages), 1)
        self.assertEqual(response.status_code, 200)

        message = Message.objects.get(username=username);

        self.assertEqual(int(response.content), message.id);
        self.assertEqual(message.username, username);
        self.assertTrue(message.typing)
        self.assertEqual(message.message_content, message_content)
        self.assertEqual(datetime_to_timestamp(message.datetime_start), timestamp)

    def test_post_message_without_datetime_start(self):
        """
        When a message is sent without a datetime_start the view
        should produce an appropriate error and a 400(Bad Request)
        status code. The message should not be saved.
        """
        post_dict = {'message_content': 'Message', 'username': 'vitsalis', 'typing': True, 'message_type': 'text'}

        response = self.privileged_operation(
            reverse('chat:message', args=('channel', self.channel.name,)),
            post_dict,
            'post'
        )

        self.assertFalse(Message.objects.filter(username='vitsalis').exists())
        self.assertEqual(response.status_code, 400)

    def test_post_message_without_username(self):
        """
        When a message is sent without a username the view
        should produce an appropriate error and a 400(Bad Request)
        status code. The message should not be saved.
        """
        timestamp = 10 ** 11
        post_dict = {'message_content': 'Message', 'datetime_start': timestamp, 'typing': True, 'message_type': 'text'}

        response = self.privileged_operation(
            reverse('chat:message', args=('channel', self.channel.name,)),
            post_dict,
            'post'
        )

        datetime_start_field = timestamp_to_datetime(timestamp)
        self.assertFalse(Message.objects.filter(datetime_start=datetime_start_field).exists())
        self.assertEqual(response.status_code, 400)

    def test_post_message_with_invalid_channel_name(self):
        """
        When a message is sent with an invalid channel name
        the view should produce an appropriate error and a
        404(Not Found) status code. The message should not be saved.
        """
        timestamp = 10 ** 11

        response = self.privileged_operation(
            reverse('chat:message', args=('channel', 'invalid_channel',)),
            {'message_content': 'Message', 'username': 'vitsalis', 'datetime_start': timestamp, 'typing': True, 'message_type': 'text'},
            'post'
        )

        self.assertFalse(Message.objects.filter(username='vitsalis').exists())
        self.assertEqual(response.status_code, 404)

    def test_post_message_without_text(self):
        """
        When a message is sent without a channel_id the view
        should produce an appropriate error and a 400(Bad Request)
        status code. The message should not be saved.
        """
        timestamp = 10 ** 11
        post_dict = {'username': 'vitsalis', 'datetime_start': timestamp, 'typing': True, 'message_type': 'text'}

        response = self.privileged_operation(
            reverse('chat:message', args=('channel', self.channel.name,)),
            post_dict,
            'post'
        )

        self.assertFalse(Message.objects.filter(username='vitsalis').exists())
        self.assertEqual(response.status_code, 400)

    def test_post_message_with_invalid_datetime_start(self):
        """
        When a message is sent with an invalid datetime the view
        should produce an appropriate error and a 400(Bad Request)
        status code. The message should not be saved.
        """
        response = self.post_and_get_response(
            message_content='Message',
            timestamp='wtf',
            username='vitsalis',
            typing=True,
            message_type='text'
        )

        self.assertFalse(Message.objects.filter(username='vitsalis').exists())
        self.assertEqual(response.status_code, 400)

    def test_post_message_with_future_datetime_start(self):
        """
        When a message is sent with a future datetime the view
        should change the datetime to the current one and save the message.
        """
        timestamp = int(format(datetime.datetime.utcnow() + datetime.timedelta(days=1), 'U')) * 1000
        response = self.post_and_get_response(
            message_content='Message',
            timestamp=timestamp,
            username='vitsalis',
            typing=True,
            message_type='text'
        )

        messages = Message.objects.filter(username='vitsalis')
        self.assertTrue(messages.exists())
        self.assertEqual(len(messages), 1)

        self.assertTrue(datetime_to_timestamp(messages[0].datetime_start) < timestamp)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(int(response.content), messages[0].id)

    def test_post_message_with_typing_false(self):
        """
        When typing is False the view should save the message
        and make its datetime_sent equal to datetime_start.
        """
        timestamp = 10 ** 11

        response = self.post_and_get_response(
            message_content='Message',
            timestamp=timestamp,
            username='vitsalis',
            typing=False,
            message_type='text'
        )

        messages = Message.objects.filter(username='vitsalis')
        self.assertTrue(messages.exists())
        self.assertEqual(len(messages), 1)

        self.assertEqual(messages[0].datetime_sent, messages[0].datetime_start)
