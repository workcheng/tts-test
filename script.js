// 获取 DOM 元素
const addTabButton = document.getElementById('addTabButton');
const tabContainer = document.getElementById('tabContainer');
const tabContentContainer = document.getElementById('tabContentContainer');

const playButton = document.getElementById('play');


// 获取 DOM 元素
const synth = window.speechSynthesis;
const voiceSelect = document.getElementById('voice-select');
const rateInput = document.getElementById('rate-input');
const volumeInput = document.getElementById('volume-input');
const textInput = document.getElementById('text-input');
const speakBtn = document.getElementById('speak-btn');


const saveUrlBtn = document.getElementById('saveUrl');
document.getElementsByTagName('p').onclick = (e) => speak(e.target.textContent);



// 初始化 tab 计数器
let tabCount = 0;
let sartup = 0

// 添加 tab 的函数
function addTab() {
    tabCount++;
    // 创建 tab 按钮
    const tabButton = document.createElement('button');
    tabButton.textContent = `Tab ${tabCount}`;
    tabButton.classList.add('tablinks');
    tabButton.onclick = () => openTab(event, `tabContent${tabCount}`);
    tabContainer.appendChild(tabButton);

    // 创建 tab 内容
    const tabContent = document.createElement('div');
    tabContent.id = `tabContent${tabCount}`;
    tabContent.classList.add('tabcontent');

    // 添加文本段落的按钮
    const addParagraphButton = document.createElement('button');
    addParagraphButton.textContent = '添加文本段落';
    addParagraphButton.classList.add('add-paragraph-button');
    addParagraphButton.onclick = () => addParagraph(tabContent, '可编辑的文本段落');
    tabContent.appendChild(addParagraphButton);

    tabContentContainer.appendChild(tabContent);

    // 打开新添加的 tab
    openTab(null, `tabContent${tabCount}`);
    addParagraphButton.click();
}

// 打开 tab 的函数
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    if (evt) {
        evt.currentTarget.className += ' active';
    }
}

// 添加文本段落的函数
function addParagraph(tabContent) {
    sartup++
    // 获取当前页面的 URL
    const url = new URL(window.location.href);
    // 获取查询字符串参数对象
    const params = url.searchParams;
    // 获取特定参数的值
    const rawParam1 = params.get('param1')
    if (!rawParam1) {
        const paragraph = document.createElement('p');
        paragraph.contentEditable = true;
        paragraph.textContent = "可编辑的文本段落";
        // paragraph.onclick = () => speak(paragraph.textContent);
        tabContent.appendChild(paragraph);
        return
    }
    const param1 = decodeURIComponent(rawParam1);
    const param2 = params.get('param2');
    console.log('param1 的值:', param1);
    console.log('param2 的值:', param2);
    if (param1 && sartup <=1) {
        const parts = param1.split("|");
        for (let i = 0; i < parts.length; i++) {
            const buttons = document.getElementsByClassName("add-paragraph-button")
            for (let element of buttons){
                const text = parts[i];
                const paragraph = document.createElement('p');
                paragraph.contentEditable = true;
                paragraph.textContent = text;
                paragraph.onclick = () => speak(paragraph.textContent);
                tabContent.appendChild(paragraph);
            };
        }
    } else {
        const paragraph = document.createElement('p');
        paragraph.contentEditable = true;
        paragraph.textContent = "可编辑的文本段落";
        paragraph.onclick = () => speak(paragraph.textContent);
        tabContent.appendChild(paragraph);
    }
    
}

// 播放语音的函数
function playSpeech(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

// 从某个段落开始顺序播放的函数
function playSequentiallyFrom(paragraph) {
    const tabContent = paragraph.parentElement;
    const paragraphs = tabContent.getElementsByTagName('p');
    let startIndex = Array.from(paragraphs).indexOf(paragraph);

    for (let i = startIndex; i < paragraphs.length; i++) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(paragraphs[i].textContent);
        synth.speak(utterance);
        // 等待当前语音播放完成再播放下一个
        utterance.onend = () => {
            if (i + 1 < paragraphs.length) {
                const nextUtterance = new SpeechSynthesisUtterance(paragraphs[i + 1].textContent);
                synth.speak(nextUtterance);
            }
        };
    }
}

// 顺序播放功能
playButton.addEventListener('click', (e) => {
    const textSections = document.getElementsByTagName('p');
    for (let p of textSections ){
        const text = p.innerText;
        if (text.trim() !== '') {
            speak(text);
        }
    }
});

// 动态填充语音类型
function populateVoiceList() {
    const voices = synth.getVoices();
    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
}

// 播放语音
function speak(text) {
    if (text.trim() === '') {
        alert('请输入文本');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // 设置语音类型
    const selectedVoiceName = voiceSelect.value;
    const selectedVoice = synth.getVoices().find((voice) => voice.name === selectedVoiceName);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    // 设置语速
    utterance.rate = parseFloat(rateInput.value);

    // 设置音量
    utterance.volume = parseFloat(volumeInput.value);

    // 播放语音
    synth.speak(utterance);
}

function saveUrl() {
    const paragraphs = document.getElementsByTagName('p')
    let result = '';
    for (let p of paragraphs) {
        if (p.innerText.trim() !== '') {
            if (result) {
                result += '|' + p.innerText;
            } else {
                result += p.innerText;
            }
        }
    }
    if (result) {
        // 获取当前页面的 URL
        const url = new URL(window.location.href);
        // 获取查询字符串参数对象
        const params = url.searchParams;
        url.searchParams.delete('param1');
         // 更新参数值
        url.searchParams.set('param1', result);
        // 替换当前页面的URL
        window.history.replaceState({}, '', url.href);
        console.log(result)
    }
    
}

document.getElementById('save-btn').addEventListener('click', () => {
    // 获取当前页面的HTML内容
    const htmlContent = document.documentElement.outerHTML;

    // 创建一个Blob对象，包含HTML内容
    const blob = new Blob([htmlContent], { type: 'text/html' });

    // 创建一个下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'saved_page.html'; // 设置下载文件名
    a.click();

    // 释放对象URL
    URL.revokeObjectURL(downloadUrl);
});

function updateLabel(input) {
    const label = document.getElementById('upload-label');
    if (input.files.length > 0) {
      label.textContent = input.files[0].name; // 显示选择的文件名
    } else {
      label.textContent = "选择文件"; // 未选择文件时显示的文本
    }
}

translate.language.setLocal('chinese_simplified'); //设置本地语种（当前网页的语种）。如果不设置，默认就是 'chinese_simplified' 简体中文。 可填写如 'english'、'chinese_simplified' 等，具体参见文档下方关于此的说明
translate.service.use('client.edge');
translate.language.setUrlParamControl(); //url参数后可以加get方式传递 language 参数的方式控制当前网页以什么语种显示
translate.listener.start();	//开启html页面变化的监控，对变化部分会进行自动翻译。注意，这里变化区域，是指使用 translate.setDocuments(...) 设置的区域。如果未设置，那么为监控整个网页的变化
translate.execute(); //执行翻译初始化操作，显示出select语言选择

// 初始化语音列表
populateVoiceList();

// 监听语音列表变化（某些浏览器可能需要监听 voiceschanged 事件）
synth.onvoiceschanged = populateVoiceList;

// 为添加 tab 按钮添加点击事件监听器
// addTabButton.addEventListener('click', addTab);
saveUrlBtn.addEventListener('click', saveUrl);

// 初始打开第一个 tab
addTab();