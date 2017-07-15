const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');

jest.dontMock('../view.jsx');

const Message = require('../view.jsx');

describe('Message', function() {
    function renderAndGetNode(xml, node) {
        const reactNode = TestUtils.renderIntoDocument(xml);
        const domNode = TestUtils.findRenderedDOMComponentWithTag(
            reactNode,
            node
        );

        return domNode;
    }

    function renderMessage(username, own, message_content, typing, message_type) {
        return renderAndGetNode(
            <Message username={username}
                     own={own}
                     message_content={message_content}
                     typing={typing}
                     messageType={message_type}/>,
            'li'
        );
    }

    it('renders a message', function() {
        const li = renderMessage(
            'hilbert',
            false,
            'Wir müssen wissen — wir werden wissen!',
            false,
            'text'
        );

        expect(li.textContent).toContain('hilbert');
        expect(ReactDOM.findDOMNode(li).className).toContain('other');
        expect(ReactDOM.findDOMNode(li).className).not.toContain('typing');
    });

    it('distinguishes your own messages', function() {
        const li = renderMessage(
            'hilbert',
             true,
             'Wir müssen wissen — wir werden wissen!',
             false,
             'text'
        );

        expect(ReactDOM.findDOMNode(li).className).toContain('self');
    });

    it('distinguishes messages that are being typed', function() {
        var li = renderMessage(
            'hilbert',
             true,
             'Wir müssen wissen — wir werden wissen!',
             true,
             'text'
        );

        expect(ReactDOM.findDOMNode(li).className).toContain('typing');

        var link = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAAG1BMVEX///8AAACdnZ3X19eZmZnq6ur7+/vOzs7x8fHjK9NyAAAARElEQVRoge3NiQmAMBAAsNrr4/4TC9YNlBNKskBKAT42W7317LgdS2THVSzeLu6xnCN7foy/YgAAAAAAAAAAAAAAgJcuaoEAp2NAe+UAAAAASUVORK5CYII='; 

        li = renderMessage(
            'hilbert',
             true,
             link,
             true,
             'text'
        );

        expect(ReactDOM.findDOMNode(li).className).toContain('typing');
    });
});
