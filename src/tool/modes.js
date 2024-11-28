/**
 * Mode constructor function that defines a syntax mode for a given language.
 * Each mode is associated with a name, caption, file extensions, and a regex pattern for matching file extensions.
 * @param {string} name - The name of the language (e.g., 'java', 'python').
 * @param {string} caption - The display name or caption for the language (e.g., 'Java', 'Python').
 * @param {string} extensions - The file extensions associated with the language (e.g., 'java', 'py').
 */
let Mode = function (name, caption, extensions) {
    this.name = name
    this.caption = caption
    this.mode = 'ace/mode/' + name
    this.extensions = extensions
    let re
    if (/\^/.test(extensions)) {
        re = extensions.replace(/\|(\^)?/g, function (a, b) {
            return '$|' + (b ? '^' : '^.*\\.')
        }) + '$'
    } else {
        re = '^.*\\.(' + extensions + ')$'
    }
    this.extRe = new RegExp(re, 'gi')
}

/**
 * Checks if a given filename matches the file extensions associated with this language mode.
 * @param {string} filename - The name of the file to check.
 * @returns {RegExpMatchArray} True if the filename matches the extensions, false otherwise.
 */
Mode.prototype.supportsFile = function (filename) {
    return filename.match(this.extRe)
}

// Array to hold all the language modes
let modes = []

// Object to map language names to their corresponding mode objects
let modesByName = {}

// Object containing supported languages and their associated file extensions
let supportedModes = {
    ABAP: ['abap'],
    ABC: ['abc'],
    ActionScript: ['as'],
    ADA: ['ada|adb'],
    Alda: ['alda'],
    Apache_Conf: ['^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd'],
    Apex: ['apex|cls|trigger|tgr'],
    AQL: ['aql'],
    AsciiDoc: ['asciidoc|adoc'],
    ASL: ['dsl|asl'],
    Assembly_x86: ['asm|a'],
    AutoHotKey: ['ahk'],
    BatchFile: ['bat|cmd'],
    C_Cpp: ['cpp|c|cc|cxx|h|hh|hpp|ino'],
    C9Search: ['c9search_results'],
    Cirru: ['cirru|cr'],
    Clojure: ['clj|cljs'],
    Cobol: ['CBL|COB'],
    coffee: ['coffee|cf|cson|^Cakefile'],
    ColdFusion: ['cfm'],
    Crystal: ['cr'],
    CSharp: ['cs'],
    Csound_Document: ['csd'],
    Csound_Orchestra: ['orc'],
    Csound_Score: ['sco'],
    CSS: ['css'],
    Curly: ['curly'],
    D: ['d|di'],
    Dart: ['dart'],
    Diff: ['diff|patch'],
    Dockerfile: ['^Dockerfile'],
    Dot: ['dot'],
    Drools: ['drl'],
    Edifact: ['edi'],
    Eiffel: ['e|ge'],
    EJS: ['ejs'],
    Elixir: ['ex|exs'],
    Elm: ['elm'],
    Erlang: ['erl|hrl'],
    Forth: ['frt|fs|ldr|fth|4th'],
    Fortran: ['f|f90'],
    FSharp: ['fsi|fs|ml|mli|fsx|fsscript'],
    FSL: ['fsl'],
    FTL: ['ftl'],
    Gcode: ['gcode'],
    Gherkin: ['feature'],
    Gitignore: ['^.gitignore'],
    Glsl: ['glsl|frag|vert'],
    Gobstones: ['gbs'],
    golang: ['go'],
    GraphQLSchema: ['gql'],
    Groovy: ['groovy'],
    HAML: ['haml'],
    Handlebars: ['hbs|handlebars|tpl|mustache'],
    Haskell: ['hs'],
    Haskell_Cabal: ['cabal'],
    haXe: ['hx'],
    Hjson: ['hjson'],
    HTML: ['html|htm|xhtml|vue|we|wpy'],
    HTML_Elixir: ['eex|html.eex'],
    HTML_Ruby: ['erb|rhtml|html.erb'],
    INI: ['ini|conf|cfg|prefs'],
    Io: ['io'],
    Jack: ['jack'],
    Jade: ['jade|pug'],
    Java: ['java'],
    JavaScript: ['js|jsm|jsx'],
    JSON: ['json'],
    JSON5: ['json5'],
    JSONiq: ['jq'],
    JSP: ['jsp'],
    JSSM: ['jssm|jssm_state'],
    JSX: ['jsx'],
    Julia: ['jl'],
    Kotlin: ['kt|kts'],
    LaTeX: ['tex|latex|ltx|bib'],
    LESS: ['less'],
    Liquid: ['liquid'],
    Lisp: ['lisp'],
    LiveScript: ['ls'],
    LogiQL: ['logic|lql'],
    LSL: ['lsl'],
    Lua: ['lua'],
    LuaPage: ['lp'],
    Lucene: ['lucene'],
    Makefile: ['^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make'],
    Markdown: ['md|markdown'],
    Mask: ['mask'],
    MATLAB: ['matlab'],
    Maze: ['mz'],
    MediaWiki: ['wiki|mediawiki'],
    MEL: ['mel'],
    MIXAL: ['mixal'],
    MUSHCode: ['mc|mush'],
    MySQL: ['mysql'],
    Nginx: ['nginx|conf'],
    Nim: ['nim'],
    Nix: ['nix'],
    NSIS: ['nsi|nsh'],
    Nunjucks: ['nunjucks|nunjs|nj|njk'],
    ObjectiveC: ['m|mm'],
    OCaml: ['ml|mli'],
    Pascal: ['pas|p'],
    Perl: ['pl|pm'],
    Perl6: ['p6|pl6|pm6'],
    pgSQL: ['pgsql'],
    PHP: ['php|inc|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module'],
    PHP_Laravel_blade: ['blade.php'],
    Pig: ['pig'],
    Powershell: ['ps1'],
    Praat: ['praat|praatscript|psc|proc'],
    Prisma: ['prisma'],
    Prolog: ['plg|prolog'],
    Properties: ['properties'],
    Protobuf: ['proto'],
    Puppet: ['epp|pp'],
    Python: ['py'],
    QML: ['qml'],
    R: ['r'],
    Razor: ['cshtml|asp'],
    RDoc: ['Rd'],
    Red: ['red|reds'],
    RHTML: ['Rhtml'],
    RST: ['rst'],
    Ruby: ['rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile'],
    Rust: ['rs'],
    SASS: ['sass'],
    SCAD: ['scad'],
    Scala: ['scala|sbt'],
    Scheme: ['scm|sm|rkt|oak|scheme'],
    SCSS: ['scss'],
    SH: ['sh|bash|^.bashrc'],
    SJS: ['sjs'],
    Slim: ['slim|skim'],
    Smarty: ['smarty|tpl'],
    snippets: ['snippets'],
    Soy_Template: ['soy'],
    Space: ['space'],
    SQL: ['sql'],
    SQLServer: ['sqlserver'],
    Stylus: ['styl|stylus'],
    SVG: ['svg'],
    Swift: ['swift'],
    Tcl: ['tcl'],
    Terraform: ['tf', 'tfvars', 'terragrunt'],
    Tex: ['tex'],
    Text: ['txt'],
    Textile: ['textile'],
    Toml: ['toml'],
    TSX: ['tsx'],
    Twig: ['latte|twig|swig'],
    Typescript: ['ts|typescript|str'],
    Vala: ['vala'],
    VBScript: ['vbs|vb'],
    Velocity: ['vm'],
    Verilog: ['v|vh|sv|svh'],
    VHDL: ['vhd|vhdl'],
    Visualforce: ['vfp|component|page'],
    Wollok: ['wlk|wpgm|wtest'],
    XML: ['xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml'],
    XQuery: ['xq'],
    YAML: ['yaml|yml'],
    Zeek: ['zeek|bro'],
    Django: ['html']
}

// Object containing overrides for display names of some languages
let nameOverrides = {
    ObjectiveC: 'Objective-C',
    CSharp: 'C#',
    golang: 'Go',
    C_Cpp: 'C and C++',
    Csound_Document: 'Csound Document',
    Csound_Orchestra: 'Csound',
    Csound_Score: 'Csound Score',
    coffee: 'CoffeeScript',
    HTML_Ruby: 'HTML (Ruby)',
    HTML_Elixir: 'HTML (Elixir)',
    FTL: 'FreeMarker',
    PHP_Laravel_blade: 'PHP (Blade Template)',
    Perl6: 'Perl 6',
    AutoHotKey: 'AutoHotkey / AutoIt'
}

// Loop through supported modes and create Mode objects for each language
for (let name in supportedModes) {
    let data = supportedModes[name]
    let displayName = (nameOverrides[name] || name).replace(/_/g, ' ')
    let filename = name.toLowerCase()
    let mode = new Mode(filename, displayName, data[0])
    modesByName[filename] = mode
    modes.push(mode)
}

// Export the modes array for use in other modules
module.exports = {
    modes
}
