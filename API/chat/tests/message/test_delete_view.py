from chat.tests.message.common import *

class MessageViewDELETETests(ChatTests):
    client_class = ChatClient
    def test_delete_message(self):
        """
        The view should delete the message with the
        specified id and respond with a 204(No Content)
        code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        response = self.privileged_operation(
            reverse('chat:message', args=(message.id,)),
            {},
            'delete'
        )

        messages = Message.objects.filter(username='vitsalis')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(len(messages), 0)

    def test_delete_message_that_does_not_exist(self):
        """
        When a message with the specified id doesn't exist
        the view should respond with a 404(Not Found) code.
        """
        timestamp = 10 ** 11
        message = create_message(
            message_content='Message',
            username='vitsalis',
            channel=self.channel,
            timestamp=timestamp,
            message_type='text'
        )

        response = self.privileged_operation(
            reverse('chat:message', args=(message.id + 1,)),
            {},
            'delete'
        )

        self.assertEqual(response.status_code, 404)

        messages = Message.objects.filter(username='vitsalis')

        self.assertEqual(len(messages), 1)

