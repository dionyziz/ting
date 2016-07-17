from chat.tests.message.common import *

from django_dynamic_fixture import G

class MessageViewGETTests(ChatTests):
    def test_request_messages(self):
        """
        When a valid request is sent the view should return
        a JSON object containing messages. Each message should be
        in the form {message_content: ...,username: ..., datetime: ...}.
        The messages should be in chronological order(more recent first).
        The number of objects is specified by the lim argument.
        """
        lim = 2
        timestamp = 10 ** 11

        message1 = Message.objects.create(
            message_content='Message1',
            datetime_start=timestamp_to_datetime(timestamp),
            datetime_sent=timestamp_to_datetime(timestamp + 10),
            username='vitsalis',
            typing=True,
            channel=self.channel,
            message_type='text'
        )

        message2 = Message.objects.create(
            message_content='Message2',
            datetime_start=timestamp_to_datetime(timestamp + 60 * 60),
            datetime_sent=timestamp_to_datetime(timestamp + 60 * 60 + 10),
            username='pkakelas',
            typing=True,
            channel=self.channel,
            message_type='text'
        )

        response = self.client.get(
            reverse('chat:message', args=('channel', self.channel.name,)),
            {'lim': lim}
        )
        messages = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(messages), 2)

        # The order is reverse chronological
        self.assertEqual(messages[0]['message_content'], message2.message_content)
        self.assertEqual(messages[0]['username'], message2.username)
        self.assertEqual(messages[0]['datetime_start'], datetime_to_timestamp(message2.datetime_start))
        self.assertTrue(messages[0]['typing'])
        self.assertEqual(messages[0]['id'], message2.id)
        self.assertEqual(messages[0]['datetime_sent'], datetime_to_timestamp(message2.datetime_sent))

        self.assertEqual(messages[1]['message_content'], message1.message_content)
        self.assertEqual(messages[1]['username'], message1.username)
        self.assertEqual(messages[1]['datetime_start'], datetime_to_timestamp(message1.datetime_start))
        self.assertTrue(messages[1]['typing'])
        self.assertEqual(messages[1]['id'], message1.id)
        self.assertEqual(messages[1]['datetime_sent'], datetime_to_timestamp(message1.datetime_sent))

    def test_request_messages_with_bigger_limit_than_messages(self):
        """
        When the lim is bigger than the number of the messages
        on the database for the channel, the server should return
        all the messages for the channel.
        """
        lim = 100
        timestamp = 10 ** 11

        create_message(
            message_content='Message1',
            timestamp=timestamp,
            username='vitsalis',
            channel=self.channel,
            message_type='text'
        )

        create_message(
            message_content='Message2',
            timestamp=timestamp + 60 * 60,
            username='pkakelas',
            channel=self.channel,
            message_type='text'
        )

        messages = json.loads(self.client.get(
            reverse('chat:message', args=('channel', self.channel.name,)),
            {'lim': lim}
        ).content)

        self.assertEqual(len(messages), 2)

    def test_request_messages_with_smaller_limit_than_messages(self):
        """
        When the lim is smaller than the number of the messages
        on the database for the channel, the server should return
        no more than <lim> messages.
        """

        lim = 2
        timestamp = 10 ** 11

        for i in range(100):
            create_message(
                message_content='Message' + str(i),
                timestamp=timestamp + i,
                username='vitsalis',
                channel=self.channel,
                message_type='text'
            )

        messages = json.loads(self.client.get(
            reverse('chat:message', args=('channel', self.channel.name,)),
            {'lim': lim}
        ).content)

        self.assertEqual(len(messages), 2)

        self.assertEqual(messages[0]['message_content'], 'Message99')
        self.assertEqual(messages[1]['message_content'], 'Message98')

    def test_request_messages_without_lim(self):
        """
        When the lim is not specified the view should return
        100 messages(or less if there are less than 100 messages).
        """
        timestamp = 10 ** 11

        for i in range(200):
            create_message(
                message_content='Message' + str(i),
                timestamp=timestamp + i,
                username='vitsalis',
                channel=self.channel,
                message_type='text'
            )

        messages = json.loads(self.client.get(
            reverse('chat:message', args=('channel', self.channel.name,)),
        ).content)

        self.assertEqual(len(messages), 100)

    def test_request_messages_from_one_channel(self):
        """
        The view should return the messages from the
        channel specified.
        """
        channel1 = G(Channel, name='Channel1')
        channel2 = G(Channel, name='Channel2')
        timestamp = 10 ** 11

        message1 = create_message(
            message_content='Message1',
            timestamp=timestamp,
            username='vitsalis',
            channel=channel1,
            message_type='text'
        )

        create_message(
            message_content='Message2',
            timestamp=timestamp,
            username='vitsalis',
            channel=channel2,
            message_type='text'
        )

        messages = json.loads(self.client.get(
            reverse('chat:message', args=('channel', channel1.name,)),
        ).content)

        self.assertEqual(len(messages), 1)

        self.assertEqual(messages[0]['message_content'], message1.message_content)

    def test_request_messages_with_invalid_channel_name(self):
        """
        When the channel with the name <channel_name>
        does not exist, a 404(Not Found) response code
        should be returned from the view.
        """
        timestamp = 10 ** 11

        create_message(
            message_content='Message1',
            timestamp=timestamp,
            username='vitsalis',
            channel=self.channel,
            message_type='text'
        )

        response = self.client.get(
            reverse('chat:message', args=('channel', 'invalid_name',)),
        )

        self.assertEqual(response.status_code, 404)
