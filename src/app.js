import { Modal } from './modal';

class App 
{
    static copyFrom = 'copyfrom';

    static stableBranch = 'master';
    static devBranch = 'dev/manifest-entry'
    static repoURL = 'https://raw.githubusercontent.com/Arrorn/bookmarklet/';
    static distFolder = 'dist';
    static distURL = undefined;

    static manifestName = 'manifest.json';
    static manifest = undefined;

    static dev = true;;

    constructor()
    {
        customElements.define('modal-display', Modal);
        document.addEventListener('manifest.loaded', App._listenerManifestLoaded);
        this.loadManifest(App.manifestName);
    }

    loadManifest(manifestName)
    {
        const manifestURL = App._getDistURL() + manifestName;

        const req = new Request(manifestURL);

        fetch(req)
            .then((response) => {
                if(!response.ok)
                {
                    throw new Error(`Unable to load manifest from source: ${manifestURL} Status: ${response.status}`);
                }

                return response.json();
            })
            .then((response) => {
                console.debug(`Loaded manifest: ${manifestName} dispatching event`);
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
            let url = App.repoURL;
            if(App.dev)
            {
                url += App.devBranch + '/';
            }
            else
            {
                url += App.stableBranch + '/';
            }
            url += App.distFolder + '/';
            App.distURL = url;
            Modal.dist = url;
        }
        return App.distURL;
    }

    static _listenerManifestLoaded(event)
    {
        App.manifest = event.detail.manifest;
        const entry = App.manifest.contents.entry;
        for (const modal of App.manifest.contents.modals) {
            if(modal.name == entry)
            {
                const modalEl = document.createElement('modal-display');
                modalEl.setAttribute('src',modal.html);
                modalEl.setAttribute('css-src',modal.css);
                const body = document.getElementsByTagName('body')[0];
                body.appendChild(modalEl);
            }
        }
    }
}

export { App };
