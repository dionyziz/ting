# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_auto_20150905_1700'),
    ]

    operations = [
        migrations.RenameField(
            model_name='message',
            old_name='text',
            new_name='message_content',
        ),
        migrations.AddField(
            model_name='message',
            name='message_type',
            field=models.CharField(default=b'text', max_length=10, choices=[(b'text', b'text'), (b'image', b'image')]),
        ),
    ]
