# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_message_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='channel',
            field=models.ForeignKey(default=True, to='chat.Channel'),
        ),
    ]
