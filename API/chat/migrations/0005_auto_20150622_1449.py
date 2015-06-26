# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_auto_20150622_1447'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='channel',
            field=models.ForeignKey(to='chat.Channel'),
        ),
    ]
