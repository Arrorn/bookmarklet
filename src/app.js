(
    function()
    {
        class App
        {
            static copyFrom = 'copyfrom';

            static injectJS(name, uri)
            {
                console.debug('Injecting: ' + name + ' from ' + uri);
                let headTag = document.getElementsByTagName('head')[0];
                let jsTag = document.createElement('script');
                jsTag.type = 'text/javascript';
                jsTag.src = uri;
                jsTag.onload = App._emitInjected(name);
                headTag.appendChild(jsTag);
            }

            static copyText(e) {
                let copySelector = e.target.dataset[App.copyFrom];
                let text = document.querySelector(copySelector).innerText;
                App._copyTextToClipboard(text);
            }

            static _emitInjected(name)
            {
                console.debug('Injected: ' = name + ' dispatching event');
                const event = new CustomEvent("inject", {
                    bubbles: true,
                    composed: true,
                    detail: {
                        name: name
                    }
                });
                document.dispatchEvent(event);
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
                    console.debug('Fallback: Copying text command was ' + msg);
                } catch (err) {
                    console.error('Fallback: Unable to copy', err);
                }
                document.body.removeChild(textArea);
            }

            //Async method
            static _copyTextToClipboard(text) {
                if (!navigator.clipboard) {
                    App._fallbackCopyTextToClipboard(text);
                    return;
                }
                navigator.clipboard.writeText(text).then(
                    function() {
                        console.debug('Async: Copying to clipboard was successful!');
                    },
                    function(err) {
                        console.error('Async: Could not copy text: ', err);
                    }
                )
            };
        }
    }
)();
