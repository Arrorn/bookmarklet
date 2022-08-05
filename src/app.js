/* global DEBUG */
import { Modal } from './modal';

class App 
{
    static copyFrom = 'copyfrom';

    static stableBranch = 'master';
    static devBranch = 'dev/manifest-entry';
    static repoURL = 'https://raw.githubusercontent.com/Arrorn/bookmarklet/';
    static distFolder = 'dist';
    static distURL = undefined;

    static manifestName = 'manifest.json';
    static manifest = undefined;

    static dev = false;

    static eventListeners = {};

    constructor()
    {
        // Avoid duplicate definitions
        if(customElements.get('modal-display') === undefined)
        {
            customElements.define('modal-display', Modal);
        }
        // If the manifest.loaded listener hasn't been started start listening
        if(App.eventListeners['manifest.loaded'] === undefined)
        {
            App.eventListeners['manifest.loaded'] = App._listenerManifestLoaded;
            document.addEventListener('manifest.loaded', App.eventListeners['manifest.loaded']);
        }
        // Load the manifest
        this.loadManifest(App.manifestName);
    }

    loadManifest(manifestName)
    {
        // Get the distribution url to the manifest
        const manifestURL = App._getDistURL() + manifestName;
        // Create a get request
        const req = new Request(manifestURL);
        // Fetch the request
        fetch(req)
            .then((response) => {
                // If not ok throw
                if(!response.ok)
                {
                    throw new Error(`Unable to load manifest from source: ${manifestURL} Status: ${response.status}`);
                }
                // Return the response json promise
                return response.json();
            })
            .then((response) => {
                if(DEBUG)
                {
                    console.debug(`Loaded manifest: ${manifestName} dispatching event`);
                }
                // Dispatch event with the manifest
                const event = new CustomEvent('manifest.loaded', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        manifest: {
                            name: manifestName,
                            url: manifestURL,
                            contents: response
                        }
                    }
                });
                document.dispatchEvent(event);
            });
    }

    static _getDistURL()
    {
        if(App.distURL == undefined)
        {
            // Start with the repo
            let url = App.repoURL;
            // What branch should we pull from
            if(App.dev)
            {
                url += App.devBranch + '/';
            }
            else
            {
                url += App.stableBranch + '/';
            }
            // Add the dist folder
            url += App.distFolder + '/';
            // Update the static urls
            App.distURL = url;
            Modal.dist = url;
        }
        return App.distURL;
    }

    static _listenerManifestLoaded(event)
    {
        // Pull out the manifest
        App.manifest = event.detail.manifest;
        if(DEBUG)
        {
            console.debug('Manifest loaded: ', App.manifest);
        }
        // Get the entry modal name
        const entry = App.manifest.contents.entry;
        // Loop through the modals looking for the entry modal
        for (const modal of App.manifest.contents.modals) {
            if(modal.name == entry)
            {
                // Build the entry modal and append it to the body
                const modalEl = document.createElement('modal-display');
                modalEl.setAttribute(Modal.htmlAttributeName,modal.html);
                modalEl.setAttribute(Modal.cssAttributeName,modal.css);
                const body = document.getElementsByTagName('body')[0];
                modalEl.addEventListener('modal.loaded', ()=>{   
                    modalEl.open = true;
                    if(DEBUG)
                    {
                        console.debug('Opening entry modal');
                    }
                }, {
                    once: true
                });
                body.appendChild(modalEl);
                if(DEBUG)
                {
                    console.debug('Entry modal added to document');
                }
            }
        }
    }
}

export { App };
