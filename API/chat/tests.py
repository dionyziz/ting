import time
import json
import datetime
import urllib

from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from django_dynamic_fixture import G
from django.utils.dateformat import format
from .utils import datetime_to_timestamp, timestamp_to_datetime
from django.conf import settings
from django.http import HttpResponse, HttpRequest

from .views import privileged
from .models import Message, Channel


def create_message(message_content, timestamp, username, channel, message_type):
    """
    Creates a message with the given text, datetime,
    username, channel and with typing set to True.
    """
    return Message.objects.create(
        message_content=message_content,
        datetime_start=timestamp_to_datetime(timestamp),
        username=username,
        typing=True,
        channel=channel,
        message_type=message_type
    )


class ChatClient(Client):
    def delete(self, url, qstring, *args, **kwargs):
        return Client().delete(
            url,
            qstring,
            content_type='application/x-www-form-urlencoded',
            *args,
            **kwargs
        )

    def patch(self, url, qstring, *args, **kwargs):
        return Client().patch(
            url,
            qstring,
            content_type='application/x-www-form-urlencoded',
            *args,
            **kwargs
        )


class ChatTests(TestCase):
    def setUp(self):
        super(ChatTests, self).setUp()
        self.channel = G(Channel, name='Channel')

    def privileged_operation(self, endpoint, data, method):
        return getattr(self.client, method)(
            endpoint,
            data,
            HTTP_AUTHORIZATION=settings.PASS
        )

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


class MessageViewDELETETests(ChatTests):
    client_class = ChatClient
    def test_delete_message(self):
        """
        The view should delete the message with the
        specified id and respond with a 204(No Content)
        code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        response = self.privileged_operation(
            reverse('chat:message', args=(message.id,)),
            {},
            'delete'
        )

        messages = Message.objects.filter(username='vitsalis')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(len(messages), 0)

    def test_delete_message_that_does_not_exist(self):
        """
        When a message with the specified id doesn't exist
        the view should respond with a 404(Not Found) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        response = self.privileged_operation(
            reverse('chat:message', args=(message.id + 1,)),
            {},
            'delete'
        )

        self.assertEqual(response.status_code, 404)

        messages = Message.objects.filter(username='vitsalis')

        self.assertEqual(len(messages), 1)


class ChannelViewPOSTTests(ChatTests):
    def test_create_valid_channel(self):
        """
        When a channel is created the view should
        respond with a 204(No Content) code and save the channel
        in the database.
        """
        response = self.client.post(
            reverse('chat:channel'),
            {'name': 'New_Channel'}
        )

        self.assertTrue(Channel.objects.filter(name='New_Channel').exists())
        self.assertEqual(Channel.objects.filter(name='New_Channel').count(), 1)
        self.assertEqual(response.status_code, 204)


class ChannelViewGETTests(ChatTests):
    def test_request_valid_channel(self):
        """
        When a channel with a name that exists in
        the database is requested, the view should return
        a JSON object containing the name of the channel
        and a 200(OK) status code.
        """
        response = self.client.get(
            reverse('chat:channel'),
            {'name': self.channel.name}
        )
        returned_channel = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(returned_channel['name'], self.channel.name)

    def test_request_channel_that_does_not_exist(self):
        """
        When a channel that does not exist is requested
        the view should return a 404(Not Found) status code.
        """
        response = self.client.get(
            reverse('chat:channel'),
            {'name': 'invalid_channel'}
        )

        self.assertEqual(response.status_code, 404)


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


class ChannelModelTests(ChatTests):
    def test_channel_create(self):
        """
        A channel must be saved in the database.
        """
        channels = Channel.objects.filter(pk=self.channel.id)
        self.assertTrue(channels.exists())
        self.assertEqual(channels.count(), 1)
        self.assertEqual(channels[0].name, self.channel.name)


class URLTests(ChatTests):
    def test_urls(self):
        self.assertEqual(
            reverse('chat:message', args=('channel', 'foo',)),
            '/messages/channel/foo/'
        )


class DecoratorTests(TestCase):
    @privileged
    def privileged_view_mock(self, request, *args, **kwargs):
        """
        Mock of a view that returns an HttpResponse
        with status code 200(OK).
        """
        return HttpResponse(status=200)

    def get_request(self, password=None):
        request = HttpRequest()
        request.META = {}
        request.META['HTTP_AUTHORIZATION'] = password
        return request

    def test_request_with_correct_password(self):
        """
        When the password is correct the decorator should call
        the function passed.
        """
        request = self.get_request(password=settings.PASS)

        response = self.privileged_view_mock(request)
        self.assertEqual(response.status_code, 200)

    def test_request_with_wrong_password(self):
        """
        When the password is wrong the decorator should respond
        with a 401(Unauthorized) status code.
        """
        request = self.get_request(password='wrong')

        response = self.privileged_view_mock(request)
        self.assertEqual(response.status_code, 401)

    def test_request_with_HTTP_AUTHORIZATION_not_defined(self):
        """
        When the password is not defined the decorator should
        respond with a 401(Unauthorized) status code.
        """
        request = self.get_request()

        response = self.privileged_view_mock(request)
        self.assertEqual(response.status_code, 401)
