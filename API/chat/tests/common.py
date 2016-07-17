import time
import json
import datetime
import urllib

from django.test import TestCase, Client
from django_dynamic_fixture import G
from django.core.urlresolvers import reverse
from django.utils.dateformat import format
from chat.utils import datetime_to_timestamp, timestamp_to_datetime
from django.conf import settings

from chat.models import Message, Channel

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
