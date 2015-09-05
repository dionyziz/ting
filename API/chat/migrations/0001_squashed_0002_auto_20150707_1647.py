# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    replaces = [(b'chat', '0001_squashed_0008_auto_20150702_1437'), (b'chat', '0002_auto_20150707_1647')]

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Channel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(max_length=2000)),
                ('datetime', models.DateTimeField()),
                ('channel', models.ForeignKey(to='chat.Channel')),
                ('username', models.CharField(max_length=20)),
            ],
        ),
    ]
