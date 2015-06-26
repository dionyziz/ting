# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='channel',
            field=models.ForeignKey(default=None, to='chat.Channel'),
            preserve_default=False,
        ),
    ]
