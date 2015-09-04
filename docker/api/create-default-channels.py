from chat.models import Channel
Channel.objects.get_or_create(name='ting')
Channel.objects.get_or_create(name='dev')
