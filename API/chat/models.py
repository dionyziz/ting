from django.db import models


class Channel(models.Model):
    def __str__(self):
        return self.name

    name = models.CharField(max_length=20, unique=True)


class Message(models.Model):
    def __str__(self):
        return self.text

    def to_dict(self):
        serializable_fields = ('text', 'datetime_start', 'datetime_sent', 'username')
        return {key: getattr(self, key) for key in serializable_fields}

    TEXT = 'text'
    IMAGE = 'image'

    MESSAGE_TYPE = (
        (TEXT, 'text'),
        (IMAGE, 'image'),
    )

    text = models.TextField(max_length=2000)
    datetime_start = models.DateTimeField(default=None)
    datetime_sent = models.DateTimeField(default=None, null=True)
    typing = models.BooleanField(default=False)
    username = models.CharField(max_length=20)
    channel = models.ForeignKey(Channel)
    message_type = models.CharField(max_length=10,
                                    choices=MESSAGE_TYPE,
                                    default=TEXT)
