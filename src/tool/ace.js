/**
 * Initializes an ACE editor with a given code value and file suffix.
 * It sets the editor's theme, mode, and various options for better user experience.
 * If the file type is not recognized, it falls back to a basic text mode.
 * @param {string} codeVal - The initial content to display in the editor.
 * @param {string} [suffix='.txt'] - The file extension or suffix to determine the language mode.
 * @returns {object} The editor instance and the detected language configuration.
 */
export function editorInit(codeVal, suffix = '.txt') {
    // Import the modes configuration from a local file
    const {modes} = require('./modes')
    let language = null

    // Loop through the available modes and check if the suffix matches any file extension pattern
    for (let i = 0; i < modes.length; i++) {
        let item = modes[i]
        let temp = new RegExp(item.extRe).test(suffix)
        temp && (language = item)
    }

    // If no language is detected based on the suffix, fallback to the default 'text' mode
    if (language === null) {
        codeVal = '本文件不支持在线预览。'
        language = {
            caption: 'Text',
            extensions: 'txt',
            mode: 'ace/mode/text',
            name: 'text'
        }
    }

    // Load ACE language tools for autocompletion and other editor features
    ace.require('ace/ext/language_tools')

    // Initialize the ACE editor
    const editor = ace.edit('editor')
    editor.setTheme('ace/theme/textmate')
    editor.getSession().setMode(language.mode)

    // Set various editor options for a better user experience
    editor.setOptions({
        enableBasicAutoCompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        selectionStyle: 'line',
        fontSize: 14
    })
    editor.setReadOnly(true)
    editor.setShowPrintMargin(false)
    editor.getSession().setUseWrapMode(true)
    editor.setValue(codeVal, 1)

    return {editor, language}
}
