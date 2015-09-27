const React = require('react/addons');
const TestUtils = React.addons.TestUtils;

jest.dontMock('../view.jsx');

const Message = require('../view.jsx');

describe('Message', function() {
    function renderAndGetNode(xml, node) {
        const reactNode = TestUtils.renderIntoDocument(xml);
        const domNode = TestUtils.findRenderedDOMComponentWithTag(
            reactNode,
            node
        ).getDOMNode();

        return domNode;
    }

    function renderMessage(username, own, text, typing) {
        return renderAndGetNode(
            <Message username={username}
                     own={own}
                     text={text}
                     typing={typing} />,
            'li'
        );
    }

    it('renders a message', function() {
        const li = renderMessage(
            'hilbert',
            false,
            'Wir müssen wissen — wir werden wissen!',
            false
        );

        expect(li.textContent).toContain('hilbert');
        expect(React.findDOMNode(li).className).toContain('other');
        expect(React.findDOMNode(li).className).not.toContain('typing');
    });

    it('distinguishes your own messages', function() {
        const li = renderMessage(
            'hilbert',
             true,
             'Wir müssen wissen — wir werden wissen!',
             false
        );

        expect(React.findDOMNode(li).className).toContain('self');
    });

    it('distinguishes messages that are being typed', function() {
        const li = renderMessage(
            'hilbert',
             true,
             'Wir müssen wissen — wir werden wissen!',
             true
        );

        expect(React.findDOMNode(li).className).toContain('typing');
    });
});
