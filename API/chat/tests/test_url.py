from chat.tests.common import *

class URLTests(TestCase):
    def test_urls(self):
        self.assertEqual(
            reverse('chat:message', args=('channel', 'foo',)),
            '/messages/channel/foo/'
        )
