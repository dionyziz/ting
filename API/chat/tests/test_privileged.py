from chat.tests.common import *
from chat.views import privileged
from django.http import HttpResponse, HttpRequest

class DecoratorTests(TestCase):
    @privileged
    def privileged_view_mock(self, request, *args, **kwargs):
        """
        Mock of a view that returns an HttpResponse
        with status code 200(OK).
        """
        return HttpResponse(status=200)

    def get_request(self, password=None):
        request = HttpRequest()
        request.META = {}
        request.META['HTTP_AUTHORIZATION'] = password
        return request

    def test_request_with_correct_password(self):
        """
        When the password is correct the decorator should call
        the function passed.
        """
        request = self.get_request(password=settings.PASS)

        response = self.privileged_view_mock(request)
        self.assertEqual(response.status_code, 200)

    def test_request_with_wrong_password(self):
        """
        When the password is wrong the decorator should respond
        with a 401(Unauthorized) status code.
        """
        request = self.get_request(password='wrong')

        response = self.privileged_view_mock(request)
        self.assertEqual(response.status_code, 401)

    def test_request_with_HTTP_AUTHORIZATION_not_defined(self):
        """
        When the password is not defined the decorator should
        respond with a 401(Unauthorized) status code.
        """
        request = self.get_request()

        response = self.privileged_view_mock(request)
        self.assertEqual(response.status_code, 401)
