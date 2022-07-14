class Modal extends HTMLElement
{

    static dist = 'https://github.com/Arrorn/bookmarklet/raw/master/dist/';

    shadow = undefined;
    src = undefined;
    cssSrc = undefined;

    constructor()
    {
        super();

        this.shadow = this.attachShadow({mode: 'open'});

        let style = document.createElement('style');

        if(this.hasAttribute('css-src'))
        {
            this.cssSrc = Modal.dist + this.getAttribute('css-src');

            const req = new Request(this.cssSrc);

            fetch(req)
                .then((response) => {
                    if(!response.ok)
                    {
                        throw new Error(`Unable to load modal css from source: ${ this.cssSrc } Status: ${ response.status }`);
                    }

                    return response.body;
                })
                .then((response) => {
                    style.textContent = response;
                });
        }

        this.shadow.appendChild(style);

        if(this.hasAttribute('src'))
        {
            this.src = Modal.dist + this.getAttribute('src');

            const req = new Request(this.src);

            fetch(req)
                .then((response) => {
                    if(!response.ok)
                    {
                        throw new Error(`Unable to load modal html from source: ${ this.src } Status: ${ response.status }`);
                    }

                    return response.body;
                })
                .then((response) => {
                    let dummy = document.createElement('div');
                    dummy.innerHTML = response;
                    while(dummy.firstChild)
                    {
                        this.shadow.appendChild(dummy.firstChild);
                    }
                });
        }
    }

}

export { Modal };