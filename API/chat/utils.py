import pytz
import datetime
import time


def datetime_to_timestamp(datetime):
    """
    Takes a datetime and returns
    a unix epoch ms.
    """
    time_without_ms = time.mktime(datetime.timetuple()) * 1000
    ms = int(datetime.microsecond / 1000)

    return time_without_ms + ms

def timestamp_to_datetime(timestamp):
    """
    Takes a timestamp and returns
    a datetime.
    """
    return datetime.datetime.fromtimestamp(timestamp / 1000.0).replace(tzinfo=pytz.UTC)
