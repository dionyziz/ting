from chat.tests.common import *

from chat.models import Message
from chat.utils import datetime_to_timestamp, timestamp_to_datetime

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

