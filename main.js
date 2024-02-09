function sleep(s) { return new Promise(resolve => setTimeout(resolve, s*1000));}

const animation = {
    time: .5,
    appear: (query) => {document.querySelector(query).style.animation = `appear ${animation.time}s`},
    disappear: (query) => {document.querySelector(query).style.opacity = 0; document.querySelector(query).style.animation = `disappear ${animation.time}s`}
}

var db = {}

const app = document.querySelector('app')

const render = {
    remove: async () => {
        document.querySelectorAll('section').forEach(async (e) => {animation.disappear(`#${e.id}`)})
        await sleep(animation.time)
        document.querySelectorAll('section').forEach(e => {e.remove()})

    },

    search_input: `<input type="text" id="search_input" placeholder="Search...">`,
    loader: async () => {
        app.innerHTML = `
<section id="loader">
    <div class="loader">
        <div class="spinner"></div>
        <span class="text">Downloading</span>
    </div>
</section>
`
    },
    search: async () => {
        original = `   
<section id="search">
    <div class="title">
        <h1>Pirate Database</h1>
        <div class="links">
            <a href="./database.json">JSON</a>
            <a href="https://github.com/ktnk-dev/pirate-db">GitHub</a>
        </div>
    </div>
    <input type="text" id="search_input" oninput="searcher()" placeholder="Search from ${Object.keys(db).length} games">
    <div class="results">
    </div>
</section>` //<div class="result">Some game</div>



        await render.remove()
        app.innerHTML = original
        animation.appear('#search')

    }
}


async function init() {
    render.loader()
    //await sleep(1.5) // remove in release // now removed lmao
    await fetch('./database.json').then(r => {return r.json()}).then(r => {db = r})
    document.querySelector('#loader > .loader > .text').innerHTML = 'Rendering'
    render.search()
}

function searcher(no_limit = false){
    try {document.querySelector('.info').remove()} catch {}
    input_name = document.querySelector('#search_input').value.toLowerCase()
    if (input_name == '') {document.querySelector('#search > .results').innerHTML = ''; return}
    new_html = ''
    total_found = 0
    found_limit = 35
    if (no_limit) {found_limit = 9999999999}
    latest_found = ''
    Object.keys(db).forEach(name => {
        search_name = name.toLowerCase()
        if (search_name.indexOf(input_name) != -1) { 
            if (total_found < found_limit) {new_html += `<div class="result" onclick="modal('${name}')">${name}</div>` }
            total_found += 1
            latest_found = name
            
        }
    })
    console.log(latest_found, total_found);

    if (total_found >= found_limit) {new_html += `<span class="result result-warn" onclick="searcher(true)">Show other ${total_found-found_limit} results</span>`}
    if (total_found == 0) {new_html += `<span class="result result-warn">Not found</span>`}
    document.querySelector('#search > .results').innerHTML = new_html

}

function modal(name) {
    document.querySelector('#search > .results').innerHTML = ''
    console.log('found one, rendering modal');
    game = db[name]
    sources_html = ''
    Object.keys(game.sources).forEach(name => {sources_html += `<button onclick="open_url('${game.sources[name]}')">${name}</button>`})

    download_html = ''
    game.download.forEach(url => {
        text = 'Magnet'
        if (url.indexOf('rutor') != -1) {text = 'Rutor Magnet'}
        else if (url.indexOf('retracker') != -1) {text = 'PirateParty Magnet'}
        else if (url.indexOf('retracker') != -1) {text = 'ReTracker Magnet'}
        download_html += `<button onclick="magnet('${url}')">${text}</button>`
    })
    html = `        
<div class="info">
    <div class="mini">Sources</div>
    <div class="links">${sources_html}</div>
    `
    if (download_html != '') {html += `
    <div class="mini">Download</div>
    <div class="links">${download_html}</div>
    `}
    html += '</div>'
    document.querySelector('#search').innerHTML += html
    document.querySelector('#search_input').value = name
}

function set(game_name) {
    console.log('set', game_name);
    document.querySelector('#search_input').value = game_name
    searcher()
}

function open_url(url) {
    window.open(url,'_blank');
}
function copy(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}
function magnet(url) {
    copy(url)
    open_url(url)
    alert('Magnet URL has been copied')
}
