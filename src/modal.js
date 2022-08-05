/* global DEBUG */
class Modal extends HTMLElement
{

    static dist = 'https://github.com/Arrorn/bookmarklet/raw/master/dist/';

    static htmlAttributeName = 'src';
    static cssAttributeName = 'css-src';

    constructor()
    {
        super();

        this._shadow = undefined;
        this._src = undefined;
        this._cssSrc = undefined;

        this._listenerKeypress = this._listenerKeypress.bind(this);
        this._listenerCloseButton = this._listenerCloseButton.bind(this);
    }

    /**
     * Called everytime on connection to the document
     * @returns {void}
     */
    connectedCallback() 
    {
        if(DEBUG)
        {
            console.debug('Modal connected');
        }
        this.loadModal();
        this._shadow.addEventListener('keydown', this._listenerKeypress);
        this._shadow.addEventListener('click', this._listenerCloseButton);
    }

    /**
     * Called everytime on disconnection to the document
     * @returns {void}
     */
    disconnectedCallback()
    {
        if(DEBUG)
        {
            console.debug('Modal disconnected');
        }
        this._shadow.removeEventListener('keydown', this._listenerKeypress);
        this._shadow.removeEventListener('click', this._listenerCloseButton);
        this._emptyShadow();
    }

    /**
     * Monitored attributes
     * @returns {string[]}
     */
    static get observedAttributes() 
    {
        return [ Modal.htmlAttributeName, Modal.cssAttributeName ];
    }

    /**
     * Callback listener on monitor attribute name changes
     * @param   {*}     name 
     * @param   {*}     oldValue 
     * @param   {*}     newValue 
     * @returns {void}
     */
    attributeChangedCallback(name, oldValue, newValue)
    {
        if(DEBUG)
        {
            console.debug('Modal attribute: ' + name + ' changed from "' + oldValue + '" to "' + newValue + '"');
        }
        this.loadModal();
    }

    /**
     * Callback listnener when element is moved to a new document
     * @returns {void}
     */
    adoptedCallback()
    {
        if(DEBUG)
        {
            console.debug('Modal adopted');
        }
        this.loadModal();
    }

    /**
     * Refetches and redraws the modal using the attributes specified
     * @returns     {void}
     * @throws      {Error}    When unable to get the contents for the modal
     */
    loadModal()
    {
        // If we are no longer connected don't bother loading
        if(!this.isConnected)
        {
            return;
        }
        // Instantiate the shadow if it's not there
        if(this._shadow == undefined)
        {
            this._shadow = this.attachShadow({mode: 'open'});
        }
        else
        {
            // Empty the current shadow if it already has something in it
            this._emptyShadow();
        }

        // Create the style. We could use a link and then just reference off to the css file but then the html would load unpainted until the request finished loading the css. So we're going to preload the css.
        let style = document.createElement('style');
        let error;
        let fetches = [];

        if(this.hasAttribute(Modal.cssAttributeName))
        {
            // Get the attribute and append it to the dist url
            this._cssSrc = Modal.dist + this.getAttribute(Modal.cssAttributeName);
            // Create a new get request
            const req = new Request(this._cssSrc);
            // Fetch
            fetches.push(fetch(req)
                .then((response) => {
                    // If not ok throw
                    if(!response.ok)
                    {
                        throw new Error(`Unable to load modal css from source: ${ this._cssSrc } Status: ${ response.status }`);
                    }
                    // Return the response as text
                    return response.text();
                })
                .then((response) => {
                    if(DEBUG)
                    {
                        console.debug('Inserting modal css');
                    }
                    // Set the style text contents
                    style.textContent = response;
                    // Append the style to the shadow
                    this._shadow.appendChild(style);
                }).catch( (er) => {
                    error = er;
                    console.error(er);
                }));
        }

        if(this.hasAttribute(Modal.htmlAttributeName))
        {
            // Get the attribute and append it to the dist url
            this._src = Modal.dist + this.getAttribute(Modal.htmlAttributeName);
            // Create a new get request
            const req = new Request(this._src);
            // Fetch
            fetches.push(fetch(req)
                .then((response) => {
                    // If not ok throw
                    if(!response.ok)
                    {
                        throw new Error(`Unable to load modal html from source: ${ this._src } Status: ${ response.status }`);
                    }
                    // Return the response as text as well
                    return response.text();
                })
                .then((response) => {
                    if(DEBUG)
                    {
                        console.debug('Inserting modal html');
                    }
                    // Create a dummy element to parse the text into html
                    let dummy = document.createElement('div');
                    // Fill the html with the text response to parse
                    dummy.innerHTML = response;
                    // Transfer the contents of the dummy into the shadow
                    while(dummy.firstChild)
                    {
                        this._shadow.appendChild(dummy.firstChild);
                    }
                })
                .catch((er) => {
                    error = er;
                    console.error(er);
                }));
        }

        Promise.allSettled(fetches).then(()=>{
            if(error === undefined)
            {
                if(DEBUG)
                {
                    console.debug("Modal successfully loaded");
                }
                this.dispatchEvent(new CustomEvent('modal.loaded', {
                    bubbles: true
                }));
                this.focus();
            }
            else
            {
                if(DEBUG)
                {
                    console.debug("Modal failed to load properly");
                }
                this.dispatchEvent(new CustomEvent('modal.failed', {
                    bubbles: true,
                    detail: {
                        error: error
                    }
                }));
            }
        });

    }

    /**
     * @returns {void}
     */
    _emptyShadow()
    {
        if(DEBUG)
        {
            console.debug('Emptying shadow dom');
        }
        // Loop through the shadow
        while (this._shadow.firstChild)
        {
            // Empty it
            this._shadow.removeChild(this._shadow.firstChild);
        }
        this.dispatchEvent(new CustomEvent('modal.unloaded', {
            bubbles: true
        }));
    }

    /**
     * @returns {boolean}
     */
    get open()
    {
        // Get the modal's open class
        return (this._shadow.querySelector('.modal') != undefined) ? this._shadow.querySelector('.modal').classList.contains('open') : false;
    }

    /**
     * @param   {boolean} isOpen Set the open status of the modal
     * @returns {void}
     */
    set open(isOpen = true)
    {
        // If no state change return
        const prevState = this.open;
        if(prevState === isOpen)
        {
            return;
        }
        // Set the modal's open class
        if(this._shadow.querySelector('.modal') != undefined)
        {
            this._shadow.querySelector('.modal').classList.toggle('open',isOpen);
        }
        if(isOpen)
        {
            if(DEBUG)
            {
                console.debug("Modal opening");
            }
            // Emit an open event
            this.dispatchEvent(new CustomEvent('modal.open', {
                bubbles: true
            }));
        }
        else
        {
            if(DEBUG)
            {
                console.debug("Modal closing");
            }
            // Emit a close event
            this.dispatchEvent(new CustomEvent('modal.close', {
                bubbles: true
            }));
        }
    }

    /**
     * @param {Event} event 
     */
    _listenerKeypress(event)
    {
        if(event.key === 'Escape')
        {
            if(DEBUG)
            {
                console.debug("Escape key detected, closing");
            }
            event.stopPropagation();
            this.open = false;
        }
    }

    /**
     * @param {Event} event 
     */
    _listenerCloseButton(event)
    {
        let el = event.target;
        if(el.classList.contains('modal-exit'))
        {
            if(DEBUG)
            {
                console.debug("Close button click detected, closing");
            }
            event.stopPropagation();
            this.open = false;
        }
    }



}

export { Modal };