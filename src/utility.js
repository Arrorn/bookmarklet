/* global DEBUG */
class Utility
{
    static copyFrom = 'copy-from';

    static copyText(e) {
        let copySelector = e.target.dataset[Utility.copyFrom];
        let text = document.querySelector(copySelector).innerText;
        Utility._copyTextToClipboard(text);
    }

    //Fallback textarea method
    static _fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            if(DEBUG)
            {
                console.debug(`Fallback: Copying text command was ${msg}`);
            }
        } catch (err) {
            console.error('Fallback: Unable to copy', err);
        }
        document.body.removeChild(textArea);
    }

    //Async method
    static _copyTextToClipboard(text) {
        if (!navigator.clipboard) {
            Utility._fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(
            function() {
                if(DEBUG)
                {
                    console.debug('Async: Copying to clipboard was successful!');
                }
            },
            function(err) {
                console.error('Async: Could not copy text: ', err);
            }
        );
    }

    static injectJS(name, uri)
    {
        if(DEBUG)
        {
            console.debug(`Injecting: ${name} from ${uri}`);
        }
        let headTag = document.getElementsByTagName('head')[0];
        let jsTag = document.createElement('script');
        jsTag.type = 'text/javascript';
        jsTag.src = uri;
        jsTag.onload = Utility._emitInjected(name);
        headTag.appendChild(jsTag);
    }

    static _emitInjected(name)
    {
        if(DEBUG)
        {
            console.debug(`Injected: ${name} dispatching event`);
        }
        const event = new CustomEvent("inject", {
            bubbles: true,
            composed: true,
            detail: {
                name: name
            }
        });
        document.dispatchEvent(event);
    }
}

export { Utility };